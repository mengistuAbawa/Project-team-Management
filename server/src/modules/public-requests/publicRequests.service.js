const db = require("../../config/database");
const ApiError = require("../../utils/ApiError");
const usersService = require("../users/users.service");
const { assertAccessRequestRole } = require("../users/userSecurity");

async function transaction(callback) {
  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function audit(client, actorId, action, entityType, entityId, details) {
  await client.query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [actorId, action, entityType, entityId, JSON.stringify(details)]
  );
}

async function createContactMessage(data) {
  const result = await db.query(
    `INSERT INTO contact_messages (full_name, email, organization, subject, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, status, created_at`,
    [data.fullName, data.email, data.organization, data.subject, data.message]
  );
  return result.rows[0];
}

async function createAccessRequest(data) {
  const normalizedEmail = data.email.trim().toLowerCase();
  return transaction(async (client) => {
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1)::bigint)",
      [`public-access-request:${normalizedEmail}`]
    );
    const existing = await client.query(
      `SELECT id FROM access_requests
       WHERE lower(email) = $1 AND status = 'pending'`,
      [normalizedEmail]
    );
    if (existing.rows.length) {
      throw new ApiError(409, "An access request for this email is already pending.");
    }

    const result = await client.query(
      `INSERT INTO access_requests
         (full_name, email, organization, job_title, phone, reason)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, status, created_at`,
      [
        data.fullName,
        normalizedEmail,
        data.organization,
        data.jobTitle,
        data.phone || null,
        data.reason
      ]
    );
    return result.rows[0];
  });
}

function buildPagination({ page = 1, limit = 20 }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  return { page: safePage, limit: safeLimit, offset: (safePage - 1) * safeLimit };
}

async function listContactMessages({ search = "", status, page, limit }) {
  const pagination = buildPagination({ page, limit });
  const values = [];
  const conditions = [];
  if (status) {
    values.push(status);
    conditions.push(`c.status = $${values.length}`);
  }
  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(c.full_name ILIKE $${values.length} OR c.email ILIKE $${values.length}
        OR c.organization ILIKE $${values.length} OR c.subject ILIKE $${values.length})`
    );
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const count = await db.query(
    `SELECT COUNT(*)::int AS total FROM contact_messages c ${where}`,
    values
  );
  const result = await db.query(
    `SELECT c.id, c.full_name, c.email, c.organization, c.subject, c.status,
            c.created_at, c.reviewed_at, reviewer.full_name AS reviewed_by_name
     FROM contact_messages c
     LEFT JOIN users reviewer ON reviewer.id = c.reviewed_by
     ${where}
     ORDER BY c.created_at DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, pagination.limit, pagination.offset]
  );
  const total = count.rows[0].total;
  return {
    items: result.rows,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit)
    }
  };
}

async function getContactMessage(id) {
  const result = await db.query(
    `SELECT c.*, reviewer.full_name AS reviewed_by_name
     FROM contact_messages c
     LEFT JOIN users reviewer ON reviewer.id = c.reviewed_by
     WHERE c.id = $1`,
    [id]
  );
  if (!result.rows.length) throw new ApiError(404, "Contact message not found.");
  return result.rows[0];
}

async function updateContactStatus(id, status, actorId) {
  return transaction(async (client) => {
    const current = await client.query(
      "SELECT id, status FROM contact_messages WHERE id = $1 FOR UPDATE",
      [id]
    );
    if (!current.rows.length) throw new ApiError(404, "Contact message not found.");

    const result = await client.query(
      `UPDATE contact_messages
       SET status = $1,
           reviewed_by = CASE WHEN $1 = 'new' THEN NULL ELSE $2 END,
           reviewed_at = CASE WHEN $1 = 'new' THEN NULL ELSE NOW() END
       WHERE id = $3
       RETURNING id, status, reviewed_by, reviewed_at`,
      [status, actorId, id]
    );
    await audit(client, actorId, "contact_message.status_changed", "contact_message", id, {
      previousStatus: current.rows[0].status,
      status
    });
    return result.rows[0];
  });
}

async function listAccessRequests({ search = "", status, page, limit }) {
  const pagination = buildPagination({ page, limit });
  const values = [];
  const conditions = [];
  if (status) {
    values.push(status);
    conditions.push(`a.status = $${values.length}`);
  }
  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(a.full_name ILIKE $${values.length} OR a.email ILIKE $${values.length}
        OR a.organization ILIKE $${values.length} OR a.job_title ILIKE $${values.length})`
    );
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const count = await db.query(
    `SELECT COUNT(*)::int AS total FROM access_requests a ${where}`,
    values
  );
  const result = await db.query(
    `SELECT a.id, a.full_name, a.email, a.organization, a.job_title, a.phone,
            a.status, a.approved_role, a.created_at, a.reviewed_at,
            reviewer.full_name AS reviewed_by_name
     FROM access_requests a
     LEFT JOIN users reviewer ON reviewer.id = a.reviewed_by
     ${where}
     ORDER BY a.created_at DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, pagination.limit, pagination.offset]
  );
  const total = count.rows[0].total;
  return {
    items: result.rows,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit)
    }
  };
}

async function getAccessRequest(id) {
  const result = await db.query(
    `SELECT a.*, reviewer.full_name AS reviewed_by_name
     FROM access_requests a
     LEFT JOIN users reviewer ON reviewer.id = a.reviewed_by
     WHERE a.id = $1`,
    [id]
  );
  if (!result.rows.length) throw new ApiError(404, "Access request not found.");
  return result.rows[0];
}

async function reviewAccessRequest(id, { decision, role, reviewNote }, actorId) {
  if (decision === "approved") assertAccessRequestRole(role);
  if (!["approved", "rejected"].includes(decision)) {
    throw new ApiError(400, "Invalid access request decision.");
  }

  return transaction(async (client) => {
    const currentResult = await client.query(
      "SELECT * FROM access_requests WHERE id = $1 FOR UPDATE",
      [id]
    );
    const request = currentResult.rows[0];
    if (!request) throw new ApiError(404, "Access request not found.");
    if (request.status !== "pending") {
      throw new ApiError(409, "This access request has already been reviewed.");
    }

    let invitation;
    if (decision === "approved") {
      invitation = await usersService.createInvitationInTransaction(client, {
        fullName: request.full_name,
        email: request.email,
        role
      }, actorId, { replacePending: false });
    }

    const result = await client.query(
      `UPDATE access_requests
       SET status = $1, reviewed_by = $2, reviewed_at = NOW(), review_note = $3,
           approved_role = $4, invitation_id = $5
       WHERE id = $6
       RETURNING id, status, reviewed_by, reviewed_at, review_note, approved_role,
                 invitation_id`,
      [
        decision,
        actorId,
        reviewNote || null,
        decision === "approved" ? role : null,
        invitation?.id || null,
        id
      ]
    );
    await audit(client, actorId, `access_request.${decision}`, "access_request", id, {
      decision,
      ...(decision === "approved" ? { role } : {})
    });
    return { request: result.rows[0], invitation: invitation || null };
  });
}

module.exports = {
  createContactMessage,
  createAccessRequest,
  listContactMessages,
  getContactMessage,
  updateContactStatus,
  listAccessRequests,
  getAccessRequest,
  reviewAccessRequest
};

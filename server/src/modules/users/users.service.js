const db = require("../../config/database");
const env = require("../../config/env");
const ApiError = require("../../utils/ApiError");
const bcrypt = require("bcryptjs");
const {
  createInvitationToken,
  hashInvitationToken,
  assertAdminRemovalAllowed
} = require("./userSecurity");

const ALLOWED_ROLES = [
  "system_admin",
  "project_manager",
  "team_leader",
  "team_member",
  "client",
  "qa_reviewer"
];
const INVITATION_TTL_HOURS = 72;
const ADMIN_LOCK_ID = 74120531;
const ROLE_ATTRIBUTE_KEYS = {
  system_admin: ["administratorLevel", "administrativePermissions", "managedOrganizationIds"],
  project_manager: ["projectResponsibilities", "approvalScope"],
  team_leader: ["leadershipResponsibilities"],
  team_member: ["skills", "specialization", "experienceLevel", "availabilityStatus"],
  client: ["companyName", "clientCode", "contactPerson", "billingAddress", "contractReference", "clientContactInformation"],
  qa_reviewer: ["qaIdentificationCode", "qaSpecialization", "testingExpertise", "reviewResponsibilities"]
};

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

async function audit(client, actorId, action, entityType, entityId, details = {}) {
  await client.query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [actorId, action, entityType, entityId, JSON.stringify(details)]
  );
}

async function listUsers({
  search = "", role = "", organizationId = "", departmentId = "",
  status = "", page = 1, limit = 10
} = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
  const offset = (safePage - 1) * safeLimit;
  const values = [];
  const conditions = [];

  if (search.trim()) {
    values.push(`%${search.trim()}%`);
    conditions.push(
      `(u.full_name ILIKE $${values.length} OR u.email ILIKE $${values.length})`
    );
  }

  if (role) {
    if (!ALLOWED_ROLES.includes(role)) {
      throw new ApiError(400, "Invalid role filter.");
    }
    values.push(role);
    conditions.push(`r.name = $${values.length}`);
  }

  if (organizationId) {
    values.push(organizationId);
    conditions.push(`up.organization_id = $${values.length}`);
  }
  if (departmentId) {
    values.push(departmentId);
    conditions.push(`up.department_id = $${values.length}`);
  }
  if (status) {
    if (!["active", "inactive", "suspended"].includes(status)) {
      throw new ApiError(400, "Invalid account status filter.");
    }
    values.push(status);
    conditions.push(`u.account_status = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN user_profiles up ON up.user_id = u.id ${where}`,
    values
  );
  const result = await db.query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.avatar_url,
            u.is_active, u.account_status, u.email_verified, u.created_at, u.updated_at,
            r.name AS role, up.organization_id, o.name AS organization_name,
            up.department_id, d.name AS department_name,
            up.job_title, up.employee_code, up.role_attributes,
            (SELECT COUNT(*)::int FROM project_members pm WHERE pm.user_id = u.id) AS project_count,
            (SELECT COUNT(*)::int FROM team_members tm WHERE tm.user_id = u.id) AS team_count
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN user_profiles up ON up.user_id = u.id
     LEFT JOIN organizations o ON o.id = up.organization_id
     LEFT JOIN departments d ON d.id = up.department_id
     ${where}
     ORDER BY u.created_at DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, safeLimit, offset]
  );

  const total = countResult.rows[0].total;
  return {
    users: result.rows,
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) }
  };
}

async function getUserStats() {
  const [totals, roles, recent] = await Promise.all([
    db.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE account_status = 'active')::int AS active,
              COUNT(*) FILTER (WHERE account_status = 'inactive')::int AS inactive,
              COUNT(*) FILTER (WHERE account_status = 'suspended')::int AS suspended
       FROM users`
    ),
    db.query(
      `SELECT r.name AS role, COUNT(u.id)::int AS count
       FROM roles r LEFT JOIN users u ON u.role_id = r.id
       GROUP BY r.name ORDER BY r.name`
    ),
    db.query(
      `SELECT u.id, u.full_name, u.email, u.avatar_url, u.account_status,
              u.created_at, r.name AS role
       FROM users u JOIN roles r ON r.id = u.role_id
       ORDER BY u.created_at DESC LIMIT 5`
    )
  ]);
  const pending = await db.query(
    `SELECT COUNT(*)::int AS total FROM user_invitations
     WHERE accepted_at IS NULL AND revoked_at IS NULL AND expires_at > NOW()`
  );
  return {
    ...totals.rows[0],
    pendingInvitations: pending.rows[0].total,
    byRole: roles.rows,
    recentUsers: recent.rows
  };
}

async function listPendingInvitations() {
  const result = await db.query(
    `SELECT i.id, i.email, i.full_name, i.expires_at, i.created_at,
            (i.expires_at <= NOW()) AS is_expired,
            r.name AS role, o.name AS organization_name, d.name AS department_name,
            (SELECT COUNT(*)::int FROM user_invitation_project_assignments ip
             WHERE ip.invitation_id = i.id) AS project_count,
            (SELECT COUNT(*)::int FROM user_invitation_team_assignments it
             WHERE it.invitation_id = i.id) AS team_count
     FROM user_invitations i
     JOIN roles r ON r.id = i.role_id
     LEFT JOIN organizations o ON o.id = i.organization_id
     LEFT JOIN departments d ON d.id = i.department_id
     WHERE i.accepted_at IS NULL AND i.revoked_at IS NULL
     ORDER BY i.created_at DESC`
  );
  return result.rows;
}

async function resendInvitation(id, actorId) {
  return transaction(async (client) => {
    const result = await client.query(
      `SELECT i.id, i.full_name, i.email, i.organization_id, i.department_id,
              i.avatar_url, i.phone, i.job_title, i.employee_code, i.role_attributes,
              i.account_active, i.project_id, i.team_id, r.name AS role
       FROM user_invitations i
       JOIN roles r ON r.id = i.role_id
       WHERE i.id = $1 AND i.accepted_at IS NULL AND i.revoked_at IS NULL
       FOR UPDATE OF i`,
      [id]
    );
    const current = result.rows[0];
    if (!current) throw new ApiError(404, "Pending invitation not found.");

    const projects = await client.query(
      `SELECT project_id FROM user_invitation_project_assignments
       WHERE invitation_id = $1`,
      [id]
    );
    const teams = await client.query(
      `SELECT team_id FROM user_invitation_team_assignments
       WHERE invitation_id = $1`,
      [id]
    );
    const projectIds = projects.rows.map((row) => row.project_id);
    const teamIds = teams.rows.map((row) => row.team_id);
    if (current.project_id && !projectIds.includes(current.project_id)) {
      projectIds.push(current.project_id);
    }
    if (current.team_id && !teamIds.includes(current.team_id)) {
      teamIds.push(current.team_id);
    }

    return createInvitationInTransaction(client, {
      fullName: current.full_name,
      email: current.email,
      role: current.role,
      organizationId: current.organization_id,
      departmentId: current.department_id,
      avatarUrl: current.avatar_url,
      phone: current.phone,
      jobTitle: current.job_title,
      employeeCode: current.employee_code,
      roleAttributes: current.role_attributes,
      accountActive: current.account_active,
      projectIds,
      teamIds,
      confirmSystemAdmin: current.role === "system_admin"
    }, actorId);
  });
}

async function getUserById(id) {
  const result = await db.query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.avatar_url,
            u.is_active, u.account_status, u.email_verified, u.created_at, u.updated_at,
            r.name AS role, up.organization_id, o.name AS organization_name,
            up.department_id, d.name AS department_name,
            up.job_title, up.employee_code, up.role_attributes,
            COALESCE((
              SELECT jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name) ORDER BY p.name)
              FROM project_members pm JOIN projects p ON p.id = pm.project_id
              WHERE pm.user_id = u.id
            ), '[]'::jsonb) AS projects,
            COALESCE((
              SELECT jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'projectId', t.project_id) ORDER BY t.name)
              FROM team_members tm JOIN teams t ON t.id = tm.team_id
              WHERE tm.user_id = u.id
            ), '[]'::jsonb) AS teams
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN user_profiles up ON up.user_id = u.id
     LEFT JOIN organizations o ON o.id = up.organization_id
     LEFT JOIN departments d ON d.id = up.department_id
     WHERE u.id = $1`,
    [id]
  );
  if (!result.rows.length) throw new ApiError(404, "User not found.");
  return result.rows[0];
}

function normalizedIds(data, pluralField, singularField) {
  const raw = data[pluralField] ?? (data[singularField] ? [data[singularField]] : []);
  return [...new Set(raw.map((id) => id.toLowerCase()))];
}

function assertRoleAttributes(role, attributes = {}) {
  if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) {
    throw new ApiError(400, "Role attributes must be an object.");
  }
  const allowed = ROLE_ATTRIBUTE_KEYS[role];
  if (!allowed || Object.keys(attributes).some((key) => !allowed.includes(key))) {
    throw new ApiError(400, "Role attributes do not match the selected role.");
  }

  const normalized = { ...attributes };
  const arrayFields = ["administrativePermissions", "skills", "testingExpertise"];
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  for (const field of arrayFields) {
    if (normalized[field] !== undefined &&
        (!Array.isArray(normalized[field]) || normalized[field].length > 50 ||
          normalized[field].some((value) => typeof value !== "string" || value.trim().length > 100))) {
      throw new ApiError(400, `${field} must be a list of short text values.`);
    }
  }
  if (normalized.managedOrganizationIds !== undefined) {
    if (!Array.isArray(normalized.managedOrganizationIds) ||
        normalized.managedOrganizationIds.length > 100 ||
        normalized.managedOrganizationIds.some((id) => typeof id !== "string" || !uuidPattern.test(id))) {
      throw new ApiError(400, "Managed organizations must be valid organization IDs.");
    }
    normalized.managedOrganizationIds = [...new Set(normalized.managedOrganizationIds.map((id) => id.toLowerCase()))];
  }
  for (const [field, value] of Object.entries(normalized)) {
    if (arrayFields.includes(field) || field === "managedOrganizationIds") continue;
    if (typeof value !== "string" || value.trim().length > 2000) {
      throw new ApiError(400, `${field} must be text no longer than 2000 characters.`);
    }
  }
  if (normalized.experienceLevel && !["entry", "intermediate", "senior", "expert"].includes(normalized.experienceLevel)) {
    throw new ApiError(400, "Invalid experience level.");
  }
  if (normalized.availabilityStatus && !["available", "part_time", "unavailable"].includes(normalized.availabilityStatus)) {
    throw new ApiError(400, "Invalid availability status.");
  }
  if (normalized.administratorLevel && !["global", "organization"].includes(normalized.administratorLevel)) {
    throw new ApiError(400, "Invalid administrator level.");
  }
  return normalized;
}

async function validateProfileAndAssignments(client, data, role) {
  let organizationId = data.organizationId ? data.organizationId.toLowerCase() : null;
  const departmentId = data.departmentId ? data.departmentId.toLowerCase() : null;
  const projectIds = normalizedIds(data, "projectIds", "projectId");
  const teamIds = normalizedIds(data, "teamIds", "teamId");
  const roleAttributes = assertRoleAttributes(role, data.roleAttributes || {});
  const jobTitle = data.jobTitle ? data.jobTitle.trim() : null;
  const employeeCode = data.employeeCode ? data.employeeCode.trim() : null;
  if (jobTitle && jobTitle.length > 150) throw new ApiError(400, "Job title is too long.");
  if (employeeCode && employeeCode.length > 80) throw new ApiError(400, "Employee code is too long.");

  if (role === "system_admin" && (projectIds.length || teamIds.length)) {
    throw new ApiError(400, "System administrators cannot be assigned project or team memberships.");
  }
  if (role === "system_admin" && data.confirmSystemAdmin !== true) {
    throw new ApiError(400, "Confirm global administrator privileges before creating this account.");
  }

  if (organizationId) {
    const organization = await client.query("SELECT id FROM organizations WHERE id = $1", [organizationId]);
    if (!organization.rowCount) throw new ApiError(400, "Selected organization does not exist.");
  }
  if (departmentId) {
    const department = await client.query(
      "SELECT id, organization_id FROM departments WHERE id = $1",
      [departmentId]
    );
    if (!department.rowCount) throw new ApiError(400, "Selected department does not exist.");
    const departmentOrganizationId = department.rows[0].organization_id;
    if (organizationId && departmentOrganizationId !== organizationId) {
      throw new ApiError(400, "The selected department does not belong to the selected organization.");
    }
    organizationId = organizationId || departmentOrganizationId;
  }

  if (projectIds.length) {
    const projects = await client.query(
      "SELECT id, organization_id FROM projects WHERE id = ANY($1::uuid[])",
      [projectIds]
    );
    if (projects.rowCount !== projectIds.length) {
      throw new ApiError(400, "One or more selected projects do not exist.");
    }
    if (organizationId && projects.rows.some((project) => project.organization_id !== organizationId)) {
      throw new ApiError(400, "Every assigned project must belong to the selected organization.");
    }
  }

  if (teamIds.length) {
    if (!projectIds.length) throw new ApiError(400, "Select a project before assigning teams.");
    const teams = await client.query(
      "SELECT id, project_id FROM teams WHERE id = ANY($1::uuid[])",
      [teamIds]
    );
    if (teams.rowCount !== teamIds.length ||
        teams.rows.some((team) => !projectIds.includes(team.project_id))) {
      throw new ApiError(400, "Every assigned team must belong to a selected project.");
    }
    if (!["team_leader", "team_member"].includes(role)) {
      throw new ApiError(400, "Only team leaders and team members can be assigned to teams.");
    }
  }

  if (roleAttributes.managedOrganizationIds !== undefined) {
    if (role !== "system_admin") {
      throw new ApiError(400, "Managed organizations are only available for system administrators.");
    }
    const managedIds = roleAttributes.managedOrganizationIds;
    const organizations = await client.query(
      "SELECT id FROM organizations WHERE id = ANY($1::uuid[])",
      [managedIds]
    );
    if (organizations.rowCount !== managedIds.length) {
      throw new ApiError(400, "One or more managed organizations do not exist.");
    }
    roleAttributes.managedOrganizationIds = managedIds;
  }

  return {
    organizationId, departmentId, projectIds, teamIds,
    jobTitle, employeeCode, roleAttributes
  };
}

async function createInvitationInTransaction(client, data, actorId, options = {}) {
  const { fullName, email, role } = data;
  if (!ALLOWED_ROLES.includes(role)) throw new ApiError(400, "Invalid role.");
  const { organizationId, departmentId, projectIds, teamIds, jobTitle, employeeCode, roleAttributes } =
    await validateProfileAndAssignments(client, data, role);

  const { token: rawToken, tokenHash } = createInvitationToken();
  const normalizedEmail = email.trim().toLowerCase();

  // Serialize invitations for the same normalized email and avoid duplicate open invites.
  await client.query("SELECT pg_advisory_xact_lock(hashtext($1)::bigint)", [normalizedEmail]);

  const existing = await client.query(
    "SELECT id FROM users WHERE lower(email) = $1",
    [normalizedEmail]
  );
  if (existing.rows.length) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const expiredInvitations = await client.query(
    `UPDATE user_invitations
     SET revoked_at = NOW()
     WHERE lower(email) = $1 AND accepted_at IS NULL
       AND revoked_at IS NULL AND expires_at <= NOW()
     RETURNING id`,
    [normalizedEmail]
  );
  for (const expired of expiredInvitations.rows) {
    await audit(client, actorId, "user.invitation.revoked", "user_invitation", expired.id, {
      reason: "expired"
    });
  }

  if (options.replacePending !== false) {
    const revokedInvitations = await client.query(
      `UPDATE user_invitations
       SET revoked_at = NOW()
       WHERE lower(email) = $1 AND accepted_at IS NULL AND revoked_at IS NULL
       RETURNING id`,
      [normalizedEmail]
    );
    for (const revoked of revokedInvitations.rows) {
      await audit(client, actorId, "user.invitation.revoked", "user_invitation", revoked.id, {
        reason: "replaced"
      });
    }
  } else {
    const pending = await client.query(
      `SELECT id FROM user_invitations
       WHERE lower(email) = $1 AND accepted_at IS NULL AND revoked_at IS NULL`,
      [normalizedEmail]
    );
    if (pending.rows.length) {
      throw new ApiError(409, "An active invitation already exists for this email.");
    }
  }

  const result = await client.query(
    `INSERT INTO user_invitations
       (full_name, email, role_id, organization_id, department_id, avatar_url,
        phone, job_title, employee_code, role_attributes, account_active, token_hash, invited_by, expires_at)
     SELECT $1, $2, r.id, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13,
            NOW() + ($14 * INTERVAL '1 hour')
     FROM roles r WHERE r.name = $3
     RETURNING id, email, full_name, expires_at`,
    [fullName.trim(), normalizedEmail, role, organizationId, departmentId,
      data.avatarUrl || null, data.phone || null, jobTitle, employeeCode, JSON.stringify(roleAttributes),
      data.accountActive !== false, tokenHash, actorId, INVITATION_TTL_HOURS]
  );
  if (!result.rows.length) throw new ApiError(400, "Selected role does not exist.");

  const invitationId = result.rows[0].id;
  for (const projectId of projectIds) {
    await client.query(
      `INSERT INTO user_invitation_project_assignments (invitation_id, project_id)
       VALUES ($1, $2)`,
      [invitationId, projectId]
    );
  }
  if (teamIds.length) {
    const teams = await client.query(
      "SELECT id, project_id FROM teams WHERE id = ANY($1::uuid[])",
      [teamIds]
    );
    for (const team of teams.rows) {
      await client.query(
        `INSERT INTO user_invitation_team_assignments (invitation_id, project_id, team_id)
         VALUES ($1, $2, $3)`,
        [invitationId, team.project_id, team.id]
      );
    }
  }

  await audit(client, actorId, "user.invitation.created", "user_invitation", result.rows[0].id, {
    role,
    organizationId,
    departmentId,
    projectIds,
    teamIds
  });
  const invitation = result.rows[0];

  // The bearer token is returned once to the authenticated administrator for secure delivery.
  // It is never persisted in plaintext or written to application logs.
  return {
    ...invitation,
    role,
    invitationUrl: `${env.clientUrl.replace(/\/$/, "")}/register#token=${encodeURIComponent(rawToken)}`
  };
}

async function createInvitation(data, actorId) {
  return transaction((client) => createInvitationInTransaction(client, data, actorId));
}

async function acceptInvitation({ token, password }) {
  const tokenHash = hashInvitationToken(token);
  return transaction(async (client) => {
    const inviteResult = await client.query(
      `SELECT i.id, i.full_name, i.email, i.role_id, i.project_id, i.team_id, i.invited_by,
              i.organization_id, i.department_id, i.avatar_url, i.phone, i.job_title, i.employee_code,
              i.role_attributes,
              i.account_active, r.name AS role
       FROM user_invitations i
       JOIN roles r ON r.id = i.role_id
       WHERE i.token_hash = $1 AND i.accepted_at IS NULL
         AND i.revoked_at IS NULL AND i.expires_at > NOW()
       FOR UPDATE OF i`,
      [tokenHash]
    );
    const invite = inviteResult.rows[0];
    if (!invite) throw new ApiError(400, "Invitation is invalid or has expired.");

    const duplicate = await client.query(
      "SELECT id FROM users WHERE lower(email) = $1",
      [invite.email.toLowerCase()]
    );
    if (duplicate.rows.length) throw new ApiError(409, "An account with this email already exists.");

    const projectAssignmentResult = await client.query(
      `SELECT project_id FROM user_invitation_project_assignments
       WHERE invitation_id = $1`,
      [invite.id]
    );
    const projectIds = [...new Set(projectAssignmentResult.rows.map((row) => row.project_id))];
    if (invite.project_id && !projectIds.includes(invite.project_id)) projectIds.push(invite.project_id);
    const teamAssignmentResult = await client.query(
      `SELECT project_id, team_id FROM user_invitation_team_assignments
       WHERE invitation_id = $1`,
      [invite.id]
    );
    const teamAssignments = teamAssignmentResult.rows;
    if (invite.team_id && !teamAssignments.some((item) => item.team_id === invite.team_id)) {
      teamAssignments.push({ project_id: invite.project_id, team_id: invite.team_id });
    }
    const teamIds = teamAssignments.map((team) => team.team_id);
    await validateProfileAndAssignments(client, {
      organizationId: invite.organization_id,
      departmentId: invite.department_id,
      projectIds,
      teamIds,
      jobTitle: invite.job_title,
      employeeCode: invite.employee_code,
      roleAttributes: invite.role_attributes,
      confirmSystemAdmin: true
    }, invite.role);

    const passwordHash = await bcrypt.hash(password, 12);
    const userResult = await client.query(
      `INSERT INTO users
         (full_name, email, password_hash, role_id, avatar_url, phone, is_active,
          account_status, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
       RETURNING id, full_name, email, is_active, account_status, email_verified, created_at`,
      [invite.full_name, invite.email, passwordHash, invite.role_id, invite.avatar_url, invite.phone,
        invite.account_active, invite.account_active ? "active" : "inactive"]
    );
    const user = { ...userResult.rows[0], role: invite.role };

    await client.query(
      `INSERT INTO user_profiles
         (user_id, organization_id, department_id, job_title, employee_code, role_attributes)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [user.id, invite.organization_id, invite.department_id,
        invite.job_title, invite.employee_code,
        JSON.stringify(invite.role_attributes)]
    );

    for (const projectId of projectIds) {
      if (invite.role === "project_manager") {
        await client.query(
          "UPDATE projects SET manager_id = $1, updated_at = NOW() WHERE id = $2",
          [user.id, projectId]
        );
      }
      await client.query(
        `INSERT INTO project_members (project_id, user_id, project_role)
         VALUES ($1, $2, $3)
         ON CONFLICT (project_id, user_id)
         DO UPDATE SET project_role = EXCLUDED.project_role`,
        [projectId, user.id, invite.role]
      );
    }
    for (const assignment of teamAssignments) {
      if (invite.role === "team_leader") {
        await client.query(
          "UPDATE teams SET leader_id = $1, updated_at = NOW() WHERE id = $2",
          [user.id, assignment.team_id]
        );
      }
      await client.query(
        `INSERT INTO team_members (team_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (team_id, user_id) DO NOTHING`,
        [assignment.team_id, user.id]
      );
    }

    const invitedBy = invite.invited_by || user.id;
    await audit(client, invitedBy, "user.created", "user", user.id, {
      invitationId: invite.id,
      role: invite.role,
      accountStatus: user.account_status
    });
    await audit(client, invitedBy, "user.role.assigned", "user", user.id, {
      previousRole: null,
      role: invite.role,
      invitationId: invite.id
    });
    for (const projectId of projectIds) {
      await audit(client, invitedBy, "user.project.assigned", "user", user.id, {
        projectId,
        role: invite.role,
        invitationId: invite.id
      });
    }
    for (const assignment of teamAssignments) {
      await audit(client, invitedBy, "user.team.assigned", "user", user.id, {
        teamId: assignment.team_id,
        projectId: assignment.project_id,
        role: invite.role,
        invitationId: invite.id
      });
    }
    if (invite.account_active) {
      await audit(client, invitedBy, "user.activated", "user", user.id, {
        reason: "invitation accepted"
      });
    }

    await client.query(
      "UPDATE user_invitations SET accepted_at = NOW() WHERE id = $1",
      [invite.id]
    );
    await audit(client, user.id, "user.invitation.accepted", "user", user.id, {
      invitationId: invite.id,
      role: invite.role,
      organizationId: invite.organization_id,
      departmentId: invite.department_id,
      projectIds,
      teamIds
    });

    return {
      user,
      token: invite.account_active ? require("../../utils/generateToken")(user) : null
    };
  });
}

async function lockAdminMutation(client) {
  await client.query("SELECT pg_advisory_xact_lock($1)", [ADMIN_LOCK_ID]);
}

async function assertAdminNotRemoved(client, targetId, role, isActive) {
  const targetResult = await client.query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.avatar_url,
            u.is_active, u.account_status, r.name AS role
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1 FOR UPDATE OF u`,
    [targetId]
  );
  const current = targetResult.rows[0];
  if (!current) throw new ApiError(404, "User not found.");

  const losingAdmin = current.role === "system_admin" && current.is_active &&
    ((role !== undefined && role !== "system_admin") || isActive === false);
  if (losingAdmin) {
    const count = await client.query(
      `SELECT COUNT(*)::int AS total FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE r.name = 'system_admin' AND u.account_status = 'active'`
    );
    assertAdminRemovalAllowed({
      role: current.role,
      isActive: current.is_active,
      nextRole: role,
      nextIsActive: isActive,
      activeAdminCount: count.rows[0].total
    });
  }
  return current;
}

async function updateUser(id, data, actorId) {
  if (id === actorId && data.isActive === false) {
    throw new ApiError(400, "You cannot deactivate your own account.");
  }
  try {
    return await transaction(async (client) => {
      await lockAdminMutation(client);
      const current = await assertAdminNotRemoved(client, id, undefined, data.isActive);
      const profileResult = await client.query(
        `SELECT organization_id, department_id, job_title, employee_code, role_attributes
         FROM user_profiles WHERE user_id = $1`,
        [id]
      );
      const currentProfile = profileResult.rows[0] || {};
      const fullName = data.fullName ?? current.full_name;
      const email = data.email === undefined ? current.email : data.email.trim().toLowerCase();
      const phone = data.phone === undefined ? current.phone : data.phone;
      const avatarUrl = data.avatarUrl === undefined ? current.avatar_url : data.avatarUrl;
      const isActive = data.isActive ?? current.is_active;
      const accountStatus = data.isActive === undefined
        ? current.account_status
        : (isActive ? "active" : "inactive");
      const profile = await validateProfileAndAssignments(client, {
        organizationId: data.organizationId === undefined
          ? currentProfile.organization_id : data.organizationId,
        departmentId: data.departmentId === undefined
          ? currentProfile.department_id : data.departmentId,
        jobTitle: data.jobTitle === undefined ? currentProfile.job_title : data.jobTitle,
        employeeCode: data.employeeCode === undefined ? currentProfile.employee_code : data.employeeCode,
        roleAttributes: data.roleAttributes === undefined
          ? (currentProfile.role_attributes || {}) : data.roleAttributes,
        confirmSystemAdmin: true,
        projectIds: [],
        teamIds: []
      }, current.role);

      if (email !== current.email.toLowerCase()) {
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1)::bigint)", [email]);
        const duplicate = await client.query(
          "SELECT id FROM users WHERE lower(email) = $1 AND id <> $2",
          [email, id]
        );
        if (duplicate.rows.length) {
          throw new ApiError(409, "An account with this email already exists.");
        }
      }

      const result = await client.query(
        `UPDATE users SET full_name = $1, email = $2::varchar, phone = $3,
                avatar_url = $4, is_active = $5, account_status = $6,
                email_verified = CASE WHEN lower(email) <> lower($2::varchar) THEN FALSE ELSE email_verified END,
                updated_at = CURRENT_TIMESTAMP
         WHERE id = $7
         RETURNING id, full_name, email, phone, avatar_url, is_active,
                   account_status, email_verified, updated_at`,
        [fullName, email, phone, avatarUrl, isActive, accountStatus, id]
      );
      await client.query(
        `INSERT INTO user_profiles
           (user_id, organization_id, department_id, job_title, employee_code, role_attributes)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)
         ON CONFLICT (user_id) DO UPDATE SET
           organization_id = EXCLUDED.organization_id,
           department_id = EXCLUDED.department_id,
           job_title = EXCLUDED.job_title,
           employee_code = EXCLUDED.employee_code,
           role_attributes = EXCLUDED.role_attributes,
           updated_at = NOW()`,
        [id, profile.organizationId, profile.departmentId, profile.jobTitle,
          profile.employeeCode, JSON.stringify(profile.roleAttributes)]
      );
      await audit(client, actorId, "user.updated", "user", id, {
        changedFields: Object.keys(data)
      });
      return { ...result.rows[0], role: current.role };
    });
  } catch (error) {
    if (error.code === "23505" && error.constraint === "users_email_key" && data.email !== undefined) {
      throw new ApiError(409, "An account with this email already exists.");
    }
    throw error;
  }
}

async function assignRole(id, role, actorId, confirmSystemAdmin = false) {
  if (!ALLOWED_ROLES.includes(role)) throw new ApiError(400, "Invalid role.");
  if (role === "system_admin" && confirmSystemAdmin !== true) {
    throw new ApiError(400, "Confirm global administrator privileges before assigning this role.");
  }
  if (id === actorId && role !== "system_admin") {
    throw new ApiError(400, "You cannot remove your own system administrator role.");
  }
  return transaction(async (client) => {
    await lockAdminMutation(client);
    const current = await assertAdminNotRemoved(client, id, role);
    if (role === "system_admin" && current.role !== role) {
      const membership = await client.query(
        `SELECT EXISTS (SELECT 1 FROM project_members WHERE user_id = $1)
           OR EXISTS (SELECT 1 FROM team_members WHERE user_id = $1)
           OR EXISTS (SELECT 1 FROM projects WHERE manager_id = $1)
           OR EXISTS (SELECT 1 FROM teams WHERE leader_id = $1) AS assigned`,
        [id]
      );
      if (membership.rows[0].assigned) {
        throw new ApiError(409, "Remove this user's project, team, manager, and leader assignments before making them a system administrator.");
      }
    }
    if (role !== "team_leader") {
      const leadsTeam = await client.query(
        "SELECT EXISTS (SELECT 1 FROM teams WHERE leader_id = $1) AS assigned",
        [id]
      );
      if (leadsTeam.rows[0].assigned) {
        throw new ApiError(409, "A team leader assignment must be removed before changing this user's role.");
      }
    }
    if (role !== "project_manager") {
      const managesProject = await client.query(
        "SELECT EXISTS (SELECT 1 FROM projects WHERE manager_id = $1) AS assigned",
        [id]
      );
      if (managesProject.rows[0].assigned) {
        throw new ApiError(409, "Project manager assignments must be removed before changing this user's role.");
      }
    }
    const roleResult = await client.query("SELECT id FROM roles WHERE name = $1", [role]);
    if (!roleResult.rows.length) throw new ApiError(400, "Selected role does not exist.");
    if (role !== "system_admin") {
      await client.query(
        "UPDATE project_members SET project_role = $1 WHERE user_id = $2",
        [role, id]
      );
    }
    const result = await client.query(
      `UPDATE users SET role_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING id, full_name, email`,
      [roleResult.rows[0].id, id]
    );
    if (current.role !== role) {
      await client.query(
        "UPDATE user_profiles SET role_attributes = '{}'::jsonb, updated_at = NOW() WHERE user_id = $1",
        [id]
      );
    }
    await audit(client, actorId, "user.role.updated", "user", id, {
      previousRole: current.role,
      role
    });
    return { ...result.rows[0], role };
  });
}

async function setUserStatus(id, status, actingUserId) {
  const accountStatus = typeof status === "boolean"
    ? (status ? "active" : "inactive")
    : status;
  if (!["active", "inactive", "suspended"].includes(accountStatus)) {
    throw new ApiError(400, "Invalid account status.");
  }
  const isActive = accountStatus === "active";
  if (id === actingUserId && !isActive) {
    throw new ApiError(400, "You cannot deactivate your own account.");
  }
  return transaction(async (client) => {
    await lockAdminMutation(client);
    const current = await assertAdminNotRemoved(client, id, undefined, isActive);
    const result = await client.query(
      `UPDATE users SET is_active = $1, account_status = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, full_name, email, is_active, account_status`,
      [isActive, accountStatus, id]
    );
    await audit(
      client,
      actingUserId,
      accountStatus === "active" ? "user.activated"
        : accountStatus === "suspended" ? "user.suspended" : "user.deactivated",
      "user",
      id,
      {
        previousStatus: current.account_status,
        accountStatus
      }
    );
    return result.rows[0];
  });
}

async function assignUserProjects(id, projectIds, actorId) {
  if (!Array.isArray(projectIds) || !projectIds.length) {
    throw new ApiError(400, "Select at least one project.");
  }
  const uniqueIds = [...new Set(projectIds)];
  return transaction(async (client) => {
    const userResult = await client.query(
      `SELECT u.id, r.name AS role, up.organization_id
       FROM users u JOIN roles r ON r.id = u.role_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE u.id = $1 FOR UPDATE OF u`,
      [id]
    );
    const user = userResult.rows[0];
    if (!user) throw new ApiError(404, "User not found.");
    if (user.role === "system_admin") {
      throw new ApiError(400, "System administrators cannot be assigned project memberships.");
    }

    await validateProfileAndAssignments(client, {
      organizationId: user.organization_id,
      projectIds: uniqueIds,
      teamIds: [],
      roleAttributes: {}
    }, user.role);
    for (const projectId of uniqueIds) {
      if (user.role === "project_manager") {
        await client.query(
          "UPDATE projects SET manager_id = $1, updated_at = NOW() WHERE id = $2",
          [id, projectId]
        );
      }
      await client.query(
        `INSERT INTO project_members (project_id, user_id, project_role)
         VALUES ($1, $2, $3)
         ON CONFLICT (project_id, user_id)
         DO UPDATE SET project_role = EXCLUDED.project_role`,
        [projectId, id, user.role]
      );
      await audit(client, actorId, "user.project.assigned", "user", id, {
        projectId,
        role: user.role
      });
    }
    return uniqueIds;
  });
}

async function assignUserTeams(id, teamIds, actorId) {
  if (!Array.isArray(teamIds) || !teamIds.length) {
    throw new ApiError(400, "Select at least one team.");
  }
  const uniqueIds = [...new Set(teamIds)];
  return transaction(async (client) => {
    const userResult = await client.query(
      `SELECT u.id, r.name AS role, up.organization_id
       FROM users u JOIN roles r ON r.id = u.role_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE u.id = $1 FOR UPDATE OF u`,
      [id]
    );
    const user = userResult.rows[0];
    if (!user) throw new ApiError(404, "User not found.");
    if (!["team_leader", "team_member"].includes(user.role)) {
      throw new ApiError(400, "Only team leaders and team members can be assigned to teams.");
    }
    const teams = await client.query(
      `SELECT t.id, t.project_id, p.organization_id
       FROM teams t JOIN projects p ON p.id = t.project_id
       WHERE t.id = ANY($1::uuid[])`,
      [uniqueIds]
    );
    if (teams.rowCount !== uniqueIds.length) {
      throw new ApiError(400, "One or more selected teams do not exist.");
    }
    if (user.organization_id && teams.rows.some((team) => team.organization_id !== user.organization_id)) {
      throw new ApiError(400, "Every assigned team must belong to the user's organization.");
    }

    for (const team of teams.rows) {
      if (user.role === "team_leader") {
        await client.query(
          "UPDATE teams SET leader_id = $1, updated_at = NOW() WHERE id = $2",
          [id, team.id]
        );
      }
      await client.query(
        `INSERT INTO project_members (project_id, user_id, project_role)
         VALUES ($1, $2, $3)
         ON CONFLICT (project_id, user_id)
         DO UPDATE SET project_role = EXCLUDED.project_role`,
        [team.project_id, id, user.role]
      );
      await client.query(
        `INSERT INTO team_members (team_id, user_id)
         VALUES ($1, $2) ON CONFLICT (team_id, user_id) DO NOTHING`,
        [team.id, id]
      );
      await audit(client, actorId, "user.team.assigned", "user", id, {
        teamId: team.id,
        projectId: team.project_id,
        role: user.role
      });
    }
    return uniqueIds;
  });
}

async function getUserAssignments(id) {
  const user = await db.query(
    `SELECT id FROM users WHERE id = $1`,
    [id]
  );
  if (!user.rowCount) throw new ApiError(404, "User not found.");
  const [projects, teams] = await Promise.all([
    db.query(
      `SELECT p.id, p.name, p.organization_id, o.name AS organization_name
       FROM project_members pm JOIN projects p ON p.id = pm.project_id
       LEFT JOIN organizations o ON o.id = p.organization_id
       WHERE pm.user_id = $1 ORDER BY p.name`,
      [id]
    ),
    db.query(
      `SELECT t.id, t.name, t.project_id, p.name AS project_name
       FROM team_members tm JOIN teams t ON t.id = tm.team_id
       JOIN projects p ON p.id = t.project_id
       WHERE tm.user_id = $1 ORDER BY p.name, t.name`,
      [id]
    )
  ]);
  return { projects: projects.rows, teams: teams.rows };
}

module.exports = {
  listUsers,
  getUserStats,
  listPendingInvitations,
  resendInvitation,
  getUserById,
  getUserAssignments,
  createInvitation,
  createInvitationInTransaction,
  acceptInvitation,
  updateUser,
  assignRole,
  assignUserProjects,
  assignUserTeams,
  setUserStatus,
  ALLOWED_ROLES
};

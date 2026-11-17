
const pool = require("../../config/database");
const ApiError = require("../../utils/ApiError");

const MEMBER_ROLES = [
  "team_leader",
  "team_member",
  "client",
  "qa_reviewer",
];

async function verifyOrganization(client, organizationId) {
  if (!organizationId) return;

  const result = await client.query(
    "SELECT id FROM organizations WHERE id = $1",
    [organizationId]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Organization not found");
  }
}

async function createProject(data, currentUser) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await verifyOrganization(client, data.organizationId);

    const managerId =
      currentUser.role === "system_admin"
        ? currentUser.id
        : currentUser.id;

    const projectResult = await client.query(
      `INSERT INTO projects
        (name, description, organization_id, manager_id,
         created_by, status, start_date, due_date, budget)
       VALUES ($1, $2, $3, $4, $5, 'planning', $6, $7, $8)
       RETURNING *`,
      [
        data.name,
        data.description || null,
        data.organizationId || null,
        managerId,
        currentUser.id,
        data.startDate || null,
        data.dueDate || null,
        data.budget ?? null,
      ]
    );

    const project = projectResult.rows[0];

    await client.query(
      `INSERT INTO project_members (project_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (project_id, user_id) DO NOTHING`,
      [project.id, currentUser.id]
    );

    await client.query("COMMIT");
    return project;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function listProjects(currentUser, filters = {}) {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const offset = (page - 1) * limit;

  const conditions = [];
  const values = [];
  let index = 1;

  if (currentUser.role === "project_manager") {
    conditions.push(
      `(p.manager_id = $${index} OR EXISTS (
        SELECT 1
        FROM project_members pm
        WHERE pm.project_id = p.id
          AND pm.user_id = $${index}
          AND pm.project_role = 'project_manager'
      ))`
    );
    values.push(currentUser.id);
    index++;
  } else if (currentUser.role !== "system_admin") {
    conditions.push(`EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = p.id AND pm.user_id = $${index++}
    )`);
    values.push(currentUser.id);
  }

  if (filters.status) {
    conditions.push(`p.status = $${index++}`);
    values.push(filters.status);
  }

  if (filters.search) {
    conditions.push(
      `(p.name ILIKE $${index} OR COALESCE(p.description, '') ILIKE $${index})`
    );
    values.push(`%${filters.search}%`);
    index++;
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM projects p ${whereClause}`,
    values
  );

  const projectsResult = await pool.query(
    `SELECT
       p.*,
       u.full_name AS manager_name,
       o.name AS organization_name
     FROM projects p
     LEFT JOIN users u ON u.id = p.manager_id
     LEFT JOIN organizations o ON o.id = p.organization_id
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT $${index} OFFSET $${index + 1}`,
    [...values, limit, offset]
  );

  return {
    projects: projectsResult.rows,
    pagination: {
      page,
      limit,
      total: countResult.rows[0].total,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  };
}

async function getProjectById(projectId) {
  const result = await pool.query(
    `SELECT
       p.*,
       u.full_name AS manager_name,
       o.name AS organization_name
     FROM projects p
     LEFT JOIN users u ON u.id = p.manager_id
     LEFT JOIN organizations o ON o.id = p.organization_id
     WHERE p.id = $1`,
    [projectId]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Project not found");
  }

  return result.rows[0];
}

async function updateProject(projectId, data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (data.organizationId !== undefined) {
      await verifyOrganization(client, data.organizationId);
    }

    const fields = {
      name: "name",
      description: "description",
      organizationId: "organization_id",
      startDate: "start_date",
      dueDate: "due_date",
      budget: "budget",
      status: "status",
    };

    const updates = [];
    const values = [];
    let index = 1;

    for (const [key, column] of Object.entries(fields)) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        updates.push(`${column} = $${index++}`);
        values.push(data[key] === "" ? null : data[key]);
      }
    }

    if (updates.length === 0) {
      throw new ApiError(400, "No project fields were provided");
    }

    updates.push("updated_at = NOW()");
    values.push(projectId);

    const result = await client.query(
      `UPDATE projects
       SET ${updates.join(", ")}
       WHERE id = $${index}
       RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      throw new ApiError(404, "Project not found");
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function changeProjectStatus(projectId, status) {
  const result = await pool.query(
    `UPDATE projects
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, projectId]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Project not found");
  }

  return result.rows[0];
}

async function listProjectMembers(projectId) {
  const result = await pool.query(
    `SELECT
       u.id,
       u.full_name,
       u.email,
       u.phone,
       r.name AS role,
       pm.joined_at
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     JOIN roles r ON r.id = u.role_id
     WHERE pm.project_id = $1
     ORDER BY pm.joined_at ASC`,
    [projectId]
  );

  return result.rows;
}

async function addProjectMember(projectId, userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `SELECT u.id, r.name AS role, u.is_active
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1
       FOR UPDATE OF u`,
      [userId]
    );

    if (userResult.rowCount === 0) {
      throw new ApiError(404, "User not found");
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      throw new ApiError(400, "Cannot add an inactive user to a project");
    }

    if (!MEMBER_ROLES.includes(user.role)) {
      throw new ApiError(
        400,
        "Only team leaders, team members, clients, and QA reviewers can be added as project members"
      );
    }

    const result = await client.query(
      `INSERT INTO project_members (project_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (project_id, user_id) DO NOTHING
       RETURNING project_id, user_id, joined_at`,
      [projectId, userId]
    );

    await client.query("COMMIT");

    return {
      added: result.rowCount > 0,
      membership: result.rows[0] || null,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function removeProjectMember(projectId, userId, currentUser) {
  if (userId === currentUser.id) {
    throw new ApiError(400, "You cannot remove yourself using this operation");
  }

  const projectResult = await pool.query(
    "SELECT manager_id FROM projects WHERE id = $1",
    [projectId]
  );

  if (projectResult.rowCount === 0) {
    throw new ApiError(404, "Project not found");
  }

  if (projectResult.rows[0].manager_id === userId) {
    throw new ApiError(400, "Transfer project ownership before removing its manager");
  }

  const result = await pool.query(
    `DELETE FROM project_members
     WHERE project_id = $1 AND user_id = $2
     RETURNING project_id, user_id`,
    [projectId, userId]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Project membership not found");
  }

  return result.rows[0];
}

module.exports = {
  createProject,
  listProjects,
  getProjectById,
  updateProject,
  changeProjectStatus,
  listProjectMembers,
  addProjectMember,
  removeProjectMember,
};

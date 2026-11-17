
const pool = require("../../config/database");
const ApiError = require("../../utils/ApiError");

async function verifyProject(client, projectId) {
  const result = await client.query(
    "SELECT id FROM projects WHERE id = $1",
    [projectId]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Project not found");
  }
}

async function verifyProjectUser(client, projectId, userId, requiredRole) {
  const result = await client.query(
    `SELECT u.id, u.is_active, r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     JOIN project_members pm
       ON pm.user_id = u.id
      AND pm.project_id = $1
     WHERE u.id = $2
     FOR UPDATE OF u`,
    [projectId, userId]
  );

  if (result.rowCount === 0) {
    throw new ApiError(
      404,
      "User not found or user is not a member of this project"
    );
  }

  const user = result.rows[0];

  if (!user.is_active) {
    throw new ApiError(400, "Inactive users cannot be assigned to a team");
  }

  if (user.role !== requiredRole) {
    throw new ApiError(
      400,
      `User must have the ${requiredRole} role`
    );
  }

  return user;
}

async function createTeam(projectId, data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await verifyProject(client, projectId);

    if (data.leaderId) {
      await verifyProjectUser(
        client,
        projectId,
        data.leaderId,
        "team_leader"
      );
    }

    const result = await client.query(
      `INSERT INTO teams
         (project_id, name, description, leader_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        projectId,
        data.name,
        data.description || null,
        data.leaderId || null,
      ]
    );

    const team = result.rows[0];

    if (data.leaderId) {
      await client.query(
        `INSERT INTO team_members (team_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (team_id, user_id) DO NOTHING`,
        [team.id, data.leaderId]
      );
    }

    await client.query("COMMIT");
    return team;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function listTeams(projectId, pagination = {}) {
  const page = Number(pagination.page) || 1;
  const limit = Number(pagination.limit) || 10;
  const offset = (page - 1) * limit;

  const count = await pool.query(
    "SELECT COUNT(*)::int AS total FROM teams WHERE project_id = $1",
    [projectId]
  );

  const result = await pool.query(
    `SELECT
       t.*,
       leader.full_name AS leader_name,
       COUNT(DISTINCT tm.user_id)::int AS member_count
     FROM teams t
     LEFT JOIN users leader ON leader.id = t.leader_id
     LEFT JOIN team_members tm ON tm.team_id = t.id
     WHERE t.project_id = $1
     GROUP BY t.id, leader.full_name
     ORDER BY t.created_at DESC
     LIMIT $2 OFFSET $3`,
    [projectId, limit, offset]
  );

  const total = count.rows[0].total;

  return {
    teams: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getTeam(teamId) {
  const result = await pool.query(
    `SELECT
       t.*,
       leader.full_name AS leader_name,
       p.name AS project_name,
       COUNT(DISTINCT tm.user_id)::int AS member_count
     FROM teams t
     JOIN projects p ON p.id = t.project_id
     LEFT JOIN users leader ON leader.id = t.leader_id
     LEFT JOIN team_members tm ON tm.team_id = t.id
     WHERE t.id = $1
     GROUP BY t.id, leader.full_name, p.name`,
    [teamId]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Team not found");
  }

  return result.rows[0];
}

async function updateTeam(teamId, data) {
  const fields = {
    name: "name",
    description: "description",
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

  if (!updates.length) {
    throw new ApiError(400, "No team fields were provided");
  }

  updates.push("updated_at = NOW()");
  values.push(teamId);

  const result = await pool.query(
    `UPDATE teams
     SET ${updates.join(", ")}
     WHERE id = $${index}
     RETURNING *`,
    values
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Team not found");
  }

  return result.rows[0];
}

async function assignLeader(teamId, leaderId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const teamResult = await client.query(
      "SELECT id, project_id, leader_id FROM teams WHERE id = $1 FOR UPDATE",
      [teamId]
    );

    if (teamResult.rowCount === 0) {
      throw new ApiError(404, "Team not found");
    }

    const team = teamResult.rows[0];

    await verifyProjectUser(
      client,
      team.project_id,
      leaderId,
      "team_leader"
    );

    await client.query(
      `INSERT INTO team_members (team_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (team_id, user_id) DO NOTHING`,
      [teamId, leaderId]
    );

    await client.query(
      `UPDATE teams
       SET leader_id = $1, updated_at = NOW()
       WHERE id = $2`,
      [leaderId, teamId]
    );

    await client.query("COMMIT");

    return {
      teamId,
      leaderId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function addMember(teamId, userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const teamResult = await client.query(
      "SELECT id, project_id, leader_id FROM teams WHERE id = $1 FOR UPDATE",
      [teamId]
    );

    if (teamResult.rowCount === 0) {
      throw new ApiError(404, "Team not found");
    }

    const team = teamResult.rows[0];

    await verifyProjectUser(
      client,
      team.project_id,
      userId,
      "team_member"
    );

    const result = await client.query(
      `INSERT INTO team_members (team_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (team_id, user_id) DO NOTHING
       RETURNING *`,
      [teamId, userId]
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

async function listMembers(teamId) {
  const result = await pool.query(
    `SELECT
       u.id,
       u.full_name,
       u.email,
       r.name AS role,
       tm.joined_at,
       CASE WHEN t.leader_id = u.id THEN TRUE ELSE FALSE END AS is_leader
     FROM team_members tm
     JOIN users u ON u.id = tm.user_id
     JOIN roles r ON r.id = u.role_id
     JOIN teams t ON t.id = tm.team_id
     WHERE tm.team_id = $1
     ORDER BY is_leader DESC, tm.joined_at ASC`,
    [teamId]
  );

  return result.rows;
}

async function removeMember(teamId, userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const teamResult = await client.query(
      "SELECT leader_id FROM teams WHERE id = $1 FOR UPDATE",
      [teamId]
    );

    if (teamResult.rowCount === 0) {
      throw new ApiError(404, "Team not found");
    }

    if (teamResult.rows[0].leader_id === userId) {
      throw new ApiError(
        400,
        "Assign another team leader before removing the current leader"
      );
    }

    const result = await client.query(
      `DELETE FROM team_members
       WHERE team_id = $1 AND user_id = $2
       RETURNING *`,
      [teamId, userId]
    );

    if (result.rowCount === 0) {
      throw new ApiError(404, "Team membership not found");
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

async function deleteTeam(teamId) {
  const result = await pool.query(
    "DELETE FROM teams WHERE id = $1 RETURNING id",
    [teamId]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Team not found");
  }

  return result.rows[0];
}

module.exports = {
  createTeam,
  listTeams,
  getTeam,
  updateTeam,
  assignLeader,
  addMember,
  listMembers,
  removeMember,
  deleteTeam,
};

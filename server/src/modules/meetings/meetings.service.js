
const pool = require("../../config/database");
const ApiError = require("../../utils/ApiError");

async function create(data, user) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const project = await client.query(
      `SELECT id, manager_id
       FROM projects
       WHERE id = $1`,
      [data.projectId]
    );

    if (!project.rowCount) {
      throw new ApiError(404, "Project not found");
    }

    const isMember = await client.query(
      `SELECT 1
       FROM project_members
       WHERE project_id = $1 AND user_id = $2`,
      [data.projectId, user.id]
    );

    const allowed =
      user.role === "system_admin" ||
      project.rows[0].manager_id === user.id ||
      isMember.rowCount > 0;

    if (!allowed) {
      throw new ApiError(403, "You cannot schedule a meeting for this project");
    }

    if (data.teamId) {
      const team = await client.query(
        `SELECT id
         FROM teams
         WHERE id = $1 AND project_id = $2`,
        [data.teamId, data.projectId]
      );

      if (!team.rowCount) {
        throw new ApiError(400, "Team does not belong to this project");
      }
    }

    const participantIds = [...new Set([
      user.id,
      ...(data.participantIds || []),
    ])];

    const participants = await client.query(
      `SELECT u.id
       FROM users u
       WHERE u.id = ANY($1::uuid[])
         AND u.is_active = TRUE
         AND (
           EXISTS (
             SELECT 1
             FROM project_members pm
             WHERE pm.project_id = $2
               AND pm.user_id = u.id
           )
           OR EXISTS (
             SELECT 1 FROM projects p
             WHERE p.id = $2 AND p.manager_id = u.id
           )
         )
         AND (
           $3::uuid IS NULL
           OR EXISTS (
             SELECT 1
             FROM team_members tm
             WHERE tm.team_id = $3
               AND tm.user_id = u.id
           )
           OR EXISTS (
             SELECT 1
             FROM teams t
             WHERE t.id = $3 AND t.leader_id = u.id
           )
         )`,
      [participantIds, data.projectId, data.teamId || null]
    );

    if (participants.rowCount !== participantIds.length) {
      throw new ApiError(
        400,
        "Every participant must be active and belong to the selected project/team"
      );
    }

    const created = await client.query(
      `INSERT INTO collab_meetings (
         project_id,
         team_id,
         title,
         description,
         meeting_type,
         meeting_link,
         location,
         start_time,
         end_time,
         created_by
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        data.projectId,
        data.teamId || null,
        data.title,
        data.description || null,
        data.meetingType || "online",
        data.meetingLink || null,
        data.location || null,
        data.startTime,
        data.endTime,
        user.id,
      ]
    );

    const meeting = created.rows[0];

    for (const participantId of participantIds) {
      await client.query(
        `INSERT INTO meeting_participants (meeting_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (meeting_id, user_id) DO NOTHING`,
        [meeting.id, participantId]
      );
    }

    await client.query("COMMIT");
    return meeting;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function listForUser(userId) {
  const result = await pool.query(
    `SELECT
       m.*,
       p.title AS project_title,
       t.name AS team_name,
       u.full_name AS organizer_name,
       mp.response AS my_response
     FROM meeting_participants mp
     JOIN collab_meetings m ON m.id = mp.meeting_id
     JOIN projects p ON p.id = m.project_id
     LEFT JOIN teams t ON t.id = m.team_id
     LEFT JOIN users u ON u.id = m.created_by
     WHERE mp.user_id = $1
     ORDER BY m.start_time ASC`,
    [userId]
  );

  return result.rows;
}

async function getOne(meetingId, userId, role) {
  const result = await pool.query(
    `SELECT
       m.*,
       p.title AS project_title,
       t.name AS team_name,
       u.full_name AS organizer_name,
       COALESCE(
         json_agg(
           DISTINCT jsonb_build_object(
             'id', participant.id,
             'fullName', participant.full_name,
             'response', mp.response
           )
         ) FILTER (WHERE participant.id IS NOT NULL),
         '[]'
       ) AS participants
     FROM collab_meetings m
     JOIN projects p ON p.id = m.project_id
     LEFT JOIN teams t ON t.id = m.team_id
     LEFT JOIN users u ON u.id = m.created_by
     JOIN meeting_participants mine
       ON mine.meeting_id = m.id
      AND mine.user_id = $2
     LEFT JOIN meeting_participants mp ON mp.meeting_id = m.id
     LEFT JOIN users participant ON participant.id = mp.user_id
     WHERE m.id = $1
     GROUP BY m.id, p.title, t.name, u.full_name`,
    [meetingId, userId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Meeting not found");
  }

  return result.rows[0];
}

async function respond(meetingId, userId, response) {
  const result = await pool.query(
    `UPDATE meeting_participants
     SET response = $1,
         responded_at = NOW()
     WHERE meeting_id = $2 AND user_id = $3
     RETURNING *`,
    [response, meetingId, userId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Meeting invitation not found");
  }

  return result.rows[0];
}

async function updateStatus(meetingId, user, status) {
  const result = await pool.query(
    `UPDATE collab_meetings m
     SET status = $1,
         updated_at = NOW()
     WHERE m.id = $2
       AND (
         m.created_by = $3
         OR EXISTS (
           SELECT 1 FROM projects p
           WHERE p.id = m.project_id
             AND p.manager_id = $3
         )
         OR $4 = 'system_admin'
       )
     RETURNING m.*`,
    [status, meetingId, user.id, user.role]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Meeting not found or you cannot update it");
  }

  return result.rows[0];
}

module.exports = {
  create,
  listForUser,
  getOne,
  respond,
  updateStatus,
};

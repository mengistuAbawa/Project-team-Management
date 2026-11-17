
const pool = require("../../config/database");
const ApiError = require("../../utils/ApiError");

async function verifyProjectMembership(client, projectId, userId) {
  const result = await client.query(
    `SELECT 1
     FROM projects p
     WHERE p.id = $1
       AND (
         p.manager_id = $2
         OR EXISTS (
           SELECT 1 FROM project_members pm
           WHERE pm.project_id = p.id AND pm.user_id = $2
         )
       )`,
    [projectId, userId]
  );

  return result.rowCount > 0;
}

async function verifyTeamMembership(client, teamId, userId) {
  const result = await client.query(
    `SELECT 1
     FROM teams t
     WHERE t.id = $1
       AND (
         t.leader_id = $2
         OR EXISTS (
           SELECT 1 FROM team_members tm
           WHERE tm.team_id = t.id AND tm.user_id = $2
         )
       )`,
    [teamId, userId]
  );

  return result.rowCount > 0;
}

async function createConversation(data, user) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const type = data.type;
    const memberIds = [...new Set([user.id, ...(data.memberIds || [])])];

    if (type === "direct" && memberIds.length !== 2) {
      throw new ApiError(400, "A direct conversation requires exactly two users");
    }

    if (type === "group" && memberIds.length < 2) {
      throw new ApiError(400, "A group requires at least two users");
    }

    if (type === "project") {
      if (!data.projectId) {
        throw new ApiError(400, "Project ID is required");
      }

      if (
        user.role !== "system_admin" &&
        !(await verifyProjectMembership(client, data.projectId, user.id))
      ) {
        throw new ApiError(403, "You are not a member of this project");
      }
    }

    if (type === "team") {
      if (!data.teamId) {
        throw new ApiError(400, "Team ID is required");
      }

      if (
        user.role !== "system_admin" &&
        !(await verifyTeamMembership(client, data.teamId, user.id))
      ) {
        throw new ApiError(403, "You are not a member of this team");
      }
    }

    const users = await client.query(
      `SELECT id, is_active
       FROM users
       WHERE id = ANY($1::uuid[])`,
      [memberIds]
    );

    if (users.rowCount !== memberIds.length) {
      throw new ApiError(400, "One or more users do not exist");
    }

    if (users.rows.some((u) => !u.is_active)) {
      throw new ApiError(400, "Inactive users cannot join conversations");
    }

    if (type === "project") {
      for (const memberId of memberIds) {
        if (
          !(await verifyProjectMembership(client, data.projectId, memberId))
        ) {
          throw new ApiError(
            400,
            "Every conversation member must belong to the project"
          );
        }
      }
    }

    if (type === "team") {
      for (const memberId of memberIds) {
        if (!(await verifyTeamMembership(client, data.teamId, memberId))) {
          throw new ApiError(
            400,
            "Every conversation member must belong to the team"
          );
        }
      }
    }

    // Return an existing direct conversation if these two users
    // already have one.
    if (type === "direct") {
      const existing = await client.query(
        `SELECT c.id
         FROM conversations c
         WHERE c.conversation_type = 'direct'
           AND (
             SELECT COUNT(*)
             FROM conversation_members cm
             WHERE cm.conversation_id = c.id
           ) = 2
           AND EXISTS (
             SELECT 1 FROM conversation_members cm
             WHERE cm.conversation_id = c.id
               AND cm.user_id = $1
           )
           AND EXISTS (
             SELECT 1 FROM conversation_members cm
             WHERE cm.conversation_id = c.id
               AND cm.user_id = $2
           )
         LIMIT 1`,
        memberIds
      );

      if (existing.rowCount) {
        await client.query("COMMIT");
        return getConversation(existing.rows[0].id, user.id);
      }
    }

    const created = await client.query(
      `INSERT INTO conversations (
         conversation_type,
         title,
         project_id,
         team_id,
         created_by
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        type,
        data.title || null,
        type === "project" ? data.projectId : null,
        type === "team" ? data.teamId : null,
        user.id,
      ]
    );

    const conversation = created.rows[0];

    for (const memberId of memberIds) {
      await client.query(
        `INSERT INTO conversation_members (conversation_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (conversation_id, user_id) DO NOTHING`,
        [conversation.id, memberId]
      );
    }

    await client.query("COMMIT");

    return getConversation(conversation.id, user.id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getConversation(conversationId, userId) {
  const result = await pool.query(
    `SELECT
       c.*,
       COALESCE(
         json_agg(
           DISTINCT jsonb_build_object(
             'id', u.id,
             'fullName', u.full_name,
             'email', u.email
           )
         ) FILTER (WHERE u.id IS NOT NULL),
         '[]'
       ) AS members,
       (
         SELECT COUNT(*)::int
         FROM chat_messages m
         WHERE m.conversation_id = c.id
           AND m.deleted_at IS NULL
           AND m.sender_id <> $2
           AND NOT EXISTS (
             SELECT 1
             FROM message_reads mr
             WHERE mr.message_id = m.id
               AND mr.user_id = $2
           )
       ) AS unread_count
     FROM conversations c
     JOIN conversation_members cm
       ON cm.conversation_id = c.id
      AND cm.user_id = $2
     LEFT JOIN conversation_members all_members
       ON all_members.conversation_id = c.id
     LEFT JOIN users u ON u.id = all_members.user_id
     WHERE c.id = $1
     GROUP BY c.id`,
    [conversationId, userId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Conversation not found");
  }

  return result.rows[0];
}

async function listConversations(userId) {
  const result = await pool.query(
    `SELECT
       c.*,
       (
         SELECT COUNT(*)::int
         FROM chat_messages m
         WHERE m.conversation_id = c.id
           AND m.deleted_at IS NULL
           AND m.sender_id <> $1
           AND NOT EXISTS (
             SELECT 1
             FROM message_reads mr
             WHERE mr.message_id = m.id
               AND mr.user_id = $1
           )
       ) AS unread_count,
       (
         SELECT jsonb_build_object(
           'id', m.id,
           'message', m.message,
           'senderId', m.sender_id,
           'createdAt', m.created_at
         )
         FROM chat_messages m
         WHERE m.conversation_id = c.id
           AND m.deleted_at IS NULL
         ORDER BY m.created_at DESC
         LIMIT 1
       ) AS last_message
     FROM conversations c
     JOIN conversation_members cm
       ON cm.conversation_id = c.id
     WHERE cm.user_id = $1
       AND c.is_archived = FALSE
     ORDER BY c.updated_at DESC`,
    [userId]
  );

  return result.rows;
}

async function addMembers(conversationId, memberIds, user) {
  const conversation = await getConversation(conversationId, user.id);

  if (!["group", "project", "team"].includes(conversation.conversation_type)) {
    throw new ApiError(400, "Members cannot be added to a direct conversation");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const memberId of [...new Set(memberIds)]) {
      if (conversation.conversation_type === "project") {
        if (
          !(await verifyProjectMembership(
            client,
            conversation.project_id,
            memberId
          ))
        ) {
          throw new ApiError(400, "User is not a project member");
        }
      }

      if (conversation.conversation_type === "team") {
        if (
          !(await verifyTeamMembership(
            client,
            conversation.team_id,
            memberId
          ))
        ) {
          throw new ApiError(400, "User is not a team member");
        }
      }

      const active = await client.query(
        "SELECT id FROM users WHERE id = $1 AND is_active = TRUE",
        [memberId]
      );

      if (!active.rowCount) {
        throw new ApiError(400, "User not found or inactive");
      }

      await client.query(
        `INSERT INTO conversation_members (conversation_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (conversation_id, user_id) DO NOTHING`,
        [conversationId, memberId]
      );
    }

    await client.query("COMMIT");
    return getConversation(conversationId, user.id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function leaveConversation(conversationId, userId) {
  const result = await pool.query(
    `DELETE FROM conversation_members
     WHERE conversation_id = $1 AND user_id = $2
     RETURNING *`,
    [conversationId, userId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Conversation membership not found");
  }

  return { left: true };
}

module.exports = {
  createConversation,
  getConversation,
  listConversations,
  addMembers,
  leaveConversation,
};

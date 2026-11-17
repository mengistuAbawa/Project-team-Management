
const pool = require("../../config/database");
const ApiError = require("../../utils/ApiError");

async function listMessages(conversationId, userId, page = 1, limit = 30) {
  const offset = (page - 1) * limit;

  const membership = await pool.query(
    `SELECT 1
     FROM conversation_members
     WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId]
  );

  if (!membership.rowCount) {
    throw new ApiError(403, "You are not a member of this conversation");
  }

  const result = await pool.query(
    `SELECT
       m.id,
       m.conversation_id,
       m.sender_id,
       sender.full_name AS sender_name,
       m.message,
       m.reply_to_id,
       m.edited_at,
       m.created_at,
       COALESCE(
         json_agg(
           DISTINCT jsonb_build_object(
             'userId', mr.user_id,
             'readAt', mr.read_at
           )
         ) FILTER (WHERE mr.user_id IS NOT NULL),
         '[]'
       ) AS read_by
     FROM chat_messages m
     LEFT JOIN users sender ON sender.id = m.sender_id
     LEFT JOIN message_reads mr ON mr.message_id = m.id
     WHERE m.conversation_id = $1
       AND m.deleted_at IS NULL
     GROUP BY m.id, sender.full_name
     ORDER BY m.created_at DESC
     LIMIT $2 OFFSET $3`,
    [conversationId, limit, offset]
  );

  const count = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM chat_messages
     WHERE conversation_id = $1 AND deleted_at IS NULL`,
    [conversationId]
  );

  return {
    messages: result.rows.reverse(),
    pagination: {
      page,
      limit,
      total: count.rows[0].total,
      totalPages: Math.ceil(count.rows[0].total / limit),
    },
  };
}

async function sendMessage(conversationId, userId, data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const member = await client.query(
      `SELECT 1
       FROM conversation_members
       WHERE conversation_id = $1 AND user_id = $2`,
      [conversationId, userId]
    );

    if (!member.rowCount) {
      throw new ApiError(403, "You are not a member of this conversation");
    }

    if (data.replyToId) {
      const parent = await client.query(
        `SELECT id
         FROM chat_messages
         WHERE id = $1
           AND conversation_id = $2
           AND deleted_at IS NULL`,
        [data.replyToId, conversationId]
      );

      if (!parent.rowCount) {
        throw new ApiError(400, "Reply target is not in this conversation");
      }
    }

    const result = await client.query(
      `INSERT INTO chat_messages (
         conversation_id,
         sender_id,
         message,
         reply_to_id
       )
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        conversationId,
        userId,
        data.message.trim(),
        data.replyToId || null,
      ]
    );

    await client.query(
      `UPDATE conversations
       SET updated_at = NOW()
       WHERE id = $1`,
      [conversationId]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function editMessage(messageId, userId, message) {
  const result = await pool.query(
    `UPDATE chat_messages
     SET message = $1,
         edited_at = NOW(),
         updated_at = NOW()
     WHERE id = $2
       AND sender_id = $3
       AND deleted_at IS NULL
     RETURNING *`,
    [message.trim(), messageId, userId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Message not found or you cannot edit it");
  }

  return result.rows[0];
}

async function deleteMessage(messageId, userId) {
  const result = await pool.query(
    `UPDATE chat_messages
     SET deleted_at = NOW(),
         message = 'This message was deleted',
         updated_at = NOW()
     WHERE id = $1
       AND sender_id = $2
       AND deleted_at IS NULL
     RETURNING *`,
    [messageId, userId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Message not found or you cannot delete it");
  }

  return result.rows[0];
}

async function markConversationRead(conversationId, userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const member = await client.query(
      `SELECT 1
       FROM conversation_members
       WHERE conversation_id = $1 AND user_id = $2`,
      [conversationId, userId]
    );

    if (!member.rowCount) {
      throw new ApiError(403, "You are not a member of this conversation");
    }

    await client.query(
      `INSERT INTO message_reads (message_id, user_id)
       SELECT m.id, $2
       FROM chat_messages m
       WHERE m.conversation_id = $1
         AND m.sender_id <> $2
         AND m.deleted_at IS NULL
       ON CONFLICT (message_id, user_id) DO NOTHING`,
      [conversationId, userId]
    );

    await client.query(
      `UPDATE conversation_members
       SET last_read_at = NOW()
       WHERE conversation_id = $1 AND user_id = $2`,
      [conversationId, userId]
    );

    await client.query("COMMIT");
    return { markedAsRead: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  listMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markConversationRead,
};


const pool = require("../../config/database");
const ApiError = require("../../utils/ApiError");

async function list(taskId) {
  const result = await pool.query(
    `SELECT
       c.*,
       u.full_name AS author_name
     FROM task_comments c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.task_id = $1
       AND c.deleted_at IS NULL
     ORDER BY c.created_at ASC`,
    [taskId]
  );

  return result.rows;
}

async function create(taskId, userId, data) {
  if (data.parentId) {
    const parent = await pool.query(
      `SELECT id
       FROM task_comments
       WHERE id = $1
         AND task_id = $2
         AND deleted_at IS NULL`,
      [data.parentId, taskId]
    );

    if (!parent.rowCount) {
      throw new ApiError(400, "Parent comment does not belong to this task");
    }
  }

  const result = await pool.query(
    `INSERT INTO task_comments (task_id, user_id, parent_id, content)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [taskId, userId, data.parentId || null, data.content.trim()]
  );

  return result.rows[0];
}

async function update(commentId, userId, content) {
  const result = await pool.query(
    `UPDATE task_comments
     SET content = $1,
         edited_at = NOW(),
         updated_at = NOW()
     WHERE id = $2
       AND user_id = $3
       AND deleted_at IS NULL
     RETURNING *`,
    [content.trim(), commentId, userId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Comment not found or you cannot edit it");
  }

  return result.rows[0];
}

async function remove(commentId, userId) {
  const result = await pool.query(
    `UPDATE task_comments
     SET deleted_at = NOW(),
         content = 'This comment was deleted',
         updated_at = NOW()
     WHERE id = $1
       AND user_id = $2
       AND deleted_at IS NULL
     RETURNING *`,
    [commentId, userId]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Comment not found or you cannot delete it");
  }

  return result.rows[0];
}

module.exports = { list, create, update, remove };

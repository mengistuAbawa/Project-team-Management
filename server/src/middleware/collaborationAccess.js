
const pool = require("../config/database");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const requireConversationAccess = asyncHandler(async (req, res, next) => {
  const conversationId = req.params.conversationId;

  const result = await pool.query(
    `SELECT
       c.*,
       EXISTS (
         SELECT 1
         FROM conversation_members cm
         WHERE cm.conversation_id = c.id
           AND cm.user_id = $2
       ) AS is_member,
       p.manager_id,
       EXISTS (
         SELECT 1
         FROM project_members pm
         WHERE pm.project_id = c.project_id
           AND pm.user_id = $2
           AND pm.project_role = 'project_manager'
       ) AS is_project_manager,
       t.leader_id
     FROM conversations c
     LEFT JOIN projects p ON p.id = c.project_id
     LEFT JOIN teams t ON t.id = c.team_id
     WHERE c.id = $1`,
    [conversationId, req.user.id]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Conversation not found");
  }

  const conversation = result.rows[0];

  const isAdmin = req.user.role === "system_admin";
  const isProjectManager =
    req.user.role === "project_manager" &&
    (conversation.manager_id === req.user.id || conversation.is_project_manager);
  const isTeamLeader =
    req.user.role === "team_leader" &&
    conversation.leader_id === req.user.id;

  if (
    !isAdmin &&
    !isProjectManager &&
    !isTeamLeader &&
    !conversation.is_member
  ) {
    throw new ApiError(403, "You cannot access this conversation");
  }

  req.conversation = conversation;
  next();
});

const requireTaskCommentAccess = asyncHandler(async (req, res, next) => {
  const result = await pool.query(
    `SELECT
       t.id,
       t.project_id,
       t.team_id,
       p.manager_id,
       tm.leader_id,
       EXISTS (
         SELECT 1
         FROM project_members pm
         WHERE pm.project_id = t.project_id
           AND pm.user_id = $2
           AND pm.project_role = 'project_manager'
       ) AS is_project_manager,
       EXISTS (
         SELECT 1
         FROM project_members pm
         WHERE pm.project_id = t.project_id
           AND pm.user_id = $2
       ) AS is_project_member,
       EXISTS (
         SELECT 1
         FROM task_assignees a
         WHERE a.task_id = t.id
           AND a.user_id = $2
       ) AS is_assignee
     FROM tasks t
     JOIN projects p ON p.id = t.project_id
     LEFT JOIN teams tm ON tm.id = t.team_id
     WHERE t.id = $1`,
    [req.params.taskId, req.user.id]
  );

  if (!result.rowCount) {
    throw new ApiError(404, "Task not found");
  }

  const task = result.rows[0];

  const isAdmin = req.user.role === "system_admin";
  const isManager =
    req.user.role === "project_manager" &&
    (task.manager_id === req.user.id || task.is_project_manager);
  const isLeader =
    req.user.role === "team_leader" &&
    task.leader_id === req.user.id;

  if (
    !isAdmin &&
    !isManager &&
    !isLeader &&
    !task.is_project_member &&
    !task.is_assignee
  ) {
    throw new ApiError(403, "You cannot discuss this task");
  }

  req.task = task;
  next();
});

module.exports = {
  requireConversationAccess,
  requireTaskCommentAccess,
};

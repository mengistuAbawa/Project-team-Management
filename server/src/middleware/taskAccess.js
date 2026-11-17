
const pool = require("../config/database");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const requireTaskAccess = asyncHandler(async (req, res, next) => {
  const taskId = req.params.taskId || req.params.id;

  const result = await pool.query(
    `SELECT
       t.id,
       t.project_id,
       t.team_id,
       t.created_by,
       t.status,
       t.qa_status,
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
         FROM team_members x
         WHERE x.team_id = t.team_id
           AND x.user_id = $2
       ) AS is_team_member,
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
    [taskId, req.user.id]
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
    throw new ApiError(403, "You cannot access this task");
  }

  req.task = task;
  next();
});

const requireTaskManager = (req, res, next) => {
  const isAdmin = req.user.role === "system_admin";
  const isManager =
    req.user.role === "project_manager" &&
    (req.task?.manager_id === req.user.id || req.task?.is_project_manager);
  const isLeader =
    req.user.role === "team_leader" &&
    req.task?.leader_id === req.user.id;

  if (!isAdmin && !isManager && !isLeader) {
    return next(
      new ApiError(
        403,
        "Only the project manager, assigned team leader, or system admin can manage this task"
      )
    );
  }

  next();
};

const requireTaskAssignee = (req, res, next) => {
  const isAdmin = req.user.role === "system_admin";
  const isManager =
    req.user.role === "project_manager" &&
    (req.task?.manager_id === req.user.id || req.task?.is_project_manager);
  const isLeader =
    req.user.role === "team_leader" &&
    req.task?.leader_id === req.user.id;
  const isAssignee = req.task?.is_assignee;

  if (!isAdmin && !isManager && !isLeader && !isAssignee) {
    return next(
      new ApiError(403, "Only task assignees or project/team managers can update this task")
    );
  }

  next();
};

const requireQaAssignee = (req, res, next) => {
  const isQaReviewer = req.user.role === "qa_reviewer";
  const isAssigned = req.task?.is_assignee;

  if (!isQaReviewer || !isAssigned) {
    return next(
      new ApiError(
        403,
        "Only an assigned QA reviewer can submit a QA review"
      )
    );
  }

  next();
};

module.exports = {
  requireTaskAccess,
  requireTaskManager,
  requireTaskAssignee,
  requireQaAssignee,
};

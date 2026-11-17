
const pool = require("../config/database");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const requireProjectAccess = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;

  if (!projectId) {
    throw new ApiError(400, "Project ID is required");
  }

  const result = await pool.query(
    `SELECT
       p.id,
       p.manager_id,
       EXISTS (
         SELECT 1
         FROM project_members pm
         WHERE pm.project_id = p.id
           AND pm.user_id = $2
           AND pm.project_role = 'project_manager'
       ) AS is_project_manager,
       EXISTS (
         SELECT 1
         FROM project_members pm
         WHERE pm.project_id = p.id
           AND pm.user_id = $2
       ) AS is_member
     FROM projects p
     WHERE p.id = $1`,
    [projectId, req.user.id]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Project not found");
  }

  const project = result.rows[0];

  const isAdmin = req.user.role === "system_admin";
  const isManager =
    req.user.role === "project_manager" &&
    (project.manager_id === req.user.id || project.is_project_manager);

  if (!isAdmin && !isManager && !project.is_member) {
    throw new ApiError(403, "You do not have access to this project");
  }

  req.project = project;
  next();
});

const requireProjectManager = (req, res, next) => {
  const isAdmin = req.user.role === "system_admin";
  const isManager =
    req.user.role === "project_manager" &&
    (req.project?.manager_id === req.user.id || req.project?.is_project_manager);

  if (!isAdmin && !isManager) {
    return next(
      new ApiError(403, "Only the system admin or project manager can perform this action")
    );
  }

  next();
};

module.exports = {
  requireProjectAccess,
  requireProjectManager,
};


const pool = require("../config/database");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const requireTeamAccess = asyncHandler(async (req, res, next) => {
  const teamId = req.params.teamId || req.params.id;

  const result = await pool.query(
    `SELECT
       t.id,
       t.project_id,
       t.leader_id,
       p.manager_id,
       EXISTS (
         SELECT 1
         FROM project_members pm
         WHERE pm.project_id = t.project_id
           AND pm.user_id = $2
           AND pm.project_role = 'project_manager'
       ) AS is_project_manager,
       EXISTS (
         SELECT 1
         FROM team_members tm
         WHERE tm.team_id = t.id
           AND tm.user_id = $2
       ) AS is_member
     FROM teams t
     JOIN projects p ON p.id = t.project_id
     WHERE t.id = $1`,
    [teamId, req.user.id]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Team not found");
  }

  const team = result.rows[0];

  const isAdmin = req.user.role === "system_admin";
  const isManager =
    req.user.role === "project_manager" &&
    (team.manager_id === req.user.id || team.is_project_manager);
  const isLeader =
    req.user.role === "team_leader" &&
    team.leader_id === req.user.id;

  if (!isAdmin && !isManager && !isLeader && !team.is_member) {
    throw new ApiError(403, "You do not have access to this team");
  }

  req.team = team;
  next();
});

const requireTeamManager = (req, res, next) => {
  const isAdmin = req.user.role === "system_admin";
  const isManager =
    req.user.role === "project_manager" &&
    (req.team?.manager_id === req.user.id || req.team?.is_project_manager);

  if (!isAdmin && !isManager) {
    return next(
      new ApiError(403, "Only the system admin or project manager can perform this action")
    );
  }

  next();
};

const requireTeamLeaderOrManager = (req, res, next) => {
  const isAdmin = req.user.role === "system_admin";
  const isManager =
    req.user.role === "project_manager" &&
    (req.team?.manager_id === req.user.id || req.team?.is_project_manager);
  const isLeader =
    req.user.role === "team_leader" &&
    req.team?.leader_id === req.user.id;

  if (!isAdmin && !isManager && !isLeader) {
    return next(
      new ApiError(403, "Only the assigned team leader, project manager, or system admin can manage team members")
    );
  }

  next();
};

module.exports = {
  requireTeamAccess,
  requireTeamManager,
  requireTeamLeaderOrManager,
};

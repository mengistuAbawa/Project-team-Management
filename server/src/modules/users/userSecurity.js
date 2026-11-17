const crypto = require("node:crypto");
const ApiError = require("../../utils/ApiError");

const ACCESS_REQUEST_ROLES = [
  "project_manager",
  "team_leader",
  "team_member",
  "client",
  "qa_reviewer"
];

function createInvitationToken() {
  const token = crypto.randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: crypto.createHash("sha256").update(token).digest("hex")
  };
}

function hashInvitationToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function assertAdminRemovalAllowed({ role, isActive, nextRole, nextIsActive, activeAdminCount }) {
  const removingActiveAdmin = role === "system_admin" && isActive &&
    ((nextRole !== undefined && nextRole !== "system_admin") || nextIsActive === false);
  if (removingActiveAdmin && activeAdminCount <= 1) {
    throw new ApiError(400, "You cannot remove or deactivate the last active system administrator.");
  }
}

function assertInvitationMembershipScope({ role, projectId, teamId }) {
  if (role === "system_admin" && (projectId || teamId)) {
    throw new ApiError(400, "System administrators cannot be assigned project or team memberships.");
  }
  if (teamId && !projectId) {
    throw new ApiError(400, "A team membership requires its project ID.");
  }
}

function assertAccessRequestRole(role) {
  if (!ACCESS_REQUEST_ROLES.includes(role)) {
    throw new ApiError(400, "Access requests cannot be approved with this role.");
  }
}

module.exports = {
  ACCESS_REQUEST_ROLES,
  createInvitationToken,
  hashInvitationToken,
  assertAdminRemovalAllowed,
  assertInvitationMembershipScope,
  assertAccessRequestRole
};

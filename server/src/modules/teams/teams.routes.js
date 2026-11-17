
const express = require("express");

const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const validate = require("../../middleware/validate");

const {
  requireProjectAccess,
  requireProjectManager,
} = require("../../middleware/projectAccess");

const {
  requireTeamAccess,
  requireTeamManager,
  requireTeamLeaderOrManager,
} = require("../../middleware/teamAccess");

const controller = require("./teams.controller");

const {
  projectIdParam,
  teamIdParam,
  teamIdOnlyParam,
  createTeamValidation,
  updateTeamValidation,
  assignLeaderValidation,
  addMemberValidation,
  removeMemberValidation,
  listTeamsValidation,
} = require("./teams.validation");

// /api/v1/projects/:projectId/teams
const projectRouter = express.Router({ mergeParams: true });

projectRouter.use(authenticate);

projectRouter.get(
  "/",
  listTeamsValidation,
  validate,
  requireProjectAccess,
  controller.list
);

projectRouter.post(
  "/",
  projectIdParam,
  createTeamValidation,
  validate,
  requireProjectAccess,
  requireProjectManager,
  controller.create
);

// /api/v1/teams/:teamId
const teamRouter = express.Router();

teamRouter.use(authenticate);

teamRouter.get(
  "/:teamId",
  teamIdParam,
  validate,
  requireTeamAccess,
  controller.getOne
);

teamRouter.patch(
  "/:teamId",
  teamIdParam,
  updateTeamValidation,
  validate,
  requireTeamAccess,
  requireTeamManager,
  controller.update
);

teamRouter.delete(
  "/:teamId",
  teamIdParam,
  validate,
  requireTeamAccess,
  requireTeamManager,
  controller.removeTeam
);

teamRouter.get(
  "/:teamId/members",
  teamIdParam,
  validate,
  requireTeamAccess,
  controller.listMembers
);

teamRouter.post(
  "/:teamId/members",
  addMemberValidation,
  validate,
  requireTeamAccess,
  requireTeamLeaderOrManager,
  controller.addMember
);

teamRouter.delete(
  "/:teamId/members/:userId",
  removeMemberValidation,
  validate,
  requireTeamAccess,
  requireTeamLeaderOrManager,
  controller.removeMember
);

teamRouter.patch(
  "/:teamId/leader",
  assignLeaderValidation,
  validate,
  requireTeamAccess,
  requireTeamManager,
  controller.assignLeader
);

module.exports = {
  projectRouter,
  teamRouter,
};

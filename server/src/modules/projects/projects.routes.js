
const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const validate = require("../../middleware/validate");

const {
  requireProjectAccess,
  requireProjectManager,
} = require("../../middleware/projectAccess");

const controller = require("./projects.controller");

const {
  uuidParam,
  projectIdParam,
  createProjectValidation,
  updateProjectValidation,
  listProjectsValidation,
  addMemberValidation,
  removeMemberValidation,
} = require("./projects.validation");

router.use(authenticate);

// All authenticated actors see only projects they are allowed to access.
router.get(
  "/",
  listProjectsValidation,
  validate,
  controller.list
);

// Only system administrators and project managers can create projects.
router.post(
  "/",
  authorize("system_admin", "project_manager"),
  createProjectValidation,
  validate,
  controller.create
);

// Project details require membership, management, or system-admin access.
router.get(
  "/:id",
  uuidParam,
  validate,
  requireProjectAccess,
  controller.getOne
);

// Update project information.
router.patch(
  "/:id",
  uuidParam,
  updateProjectValidation,
  validate,
  requireProjectAccess,
  requireProjectManager,
  controller.update
);

// Update project status.
router.patch(
  "/:id/status",
  uuidParam,
  validate,
  requireProjectAccess,
  requireProjectManager,
  (req, res, next) => {
    const allowed = [
      "planning",
      "active",
      "on_hold",
      "completed",
      "cancelled",
    ];

    if (!allowed.includes(req.body.status)) {
      const ApiError = require("../../utils/ApiError");
      return next(new ApiError(400, "Invalid project status"));
    }

    next();
  },
  controller.updateStatus
);

// Project membership.
router.get(
  "/:projectId/members",
  projectIdParam,
  validate,
  requireProjectAccess,
  controller.members
);

router.post(
  "/:projectId/members",
  addMemberValidation,
  validate,
  requireProjectAccess,
  requireProjectManager,
  controller.addMember
);

router.delete(
  "/:projectId/members/:userId",
  removeMemberValidation,
  validate,
  requireProjectAccess,
  requireProjectManager,
  controller.removeMember
);

module.exports = router;

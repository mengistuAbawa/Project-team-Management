
const express = require("express");
const { body, param } = require("express-validator");

const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const validate = require("../../middleware/validate");
const {
  requireConversationAccess,
} = require("../../middleware/collaborationAccess");

const controller = require("./conversations.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", controller.list);

router.post(
  "/",
  [
    body("type").isIn(["direct", "group", "project", "team"]),
    body("title").optional({ nullable: true }).isString().isLength({ max: 180 }),
    body("projectId").optional().isUUID(),
    body("teamId").optional().isUUID(),
    body("memberIds").optional().isArray({ min: 1, max: 100 }),
    body("memberIds.*").optional().isUUID(),
  ],
  validate,
  controller.create
);

router.get(
  "/:conversationId",
  [param("conversationId").isUUID()],
  validate,
  requireConversationAccess,
  controller.getOne
);

// Only project managers, team leaders, or admins should manage
// membership in project/team conversations. For ordinary groups,
// the conversation creator or an admin should manage membership.
router.post(
  "/:conversationId/members",
  [
    param("conversationId").isUUID(),
    body("memberIds").isArray({ min: 1, max: 100 }),
    body("memberIds.*").isUUID(),
  ],
  validate,
  requireConversationAccess,
  authorize("system_admin", "project_manager", "team_leader"),
  controller.addMembers
);

router.delete(
  "/:conversationId/leave",
  [param("conversationId").isUUID()],
  validate,
  requireConversationAccess,
  controller.leave
);

module.exports = router;

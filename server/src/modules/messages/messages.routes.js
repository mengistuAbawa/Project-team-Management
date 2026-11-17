
const express = require("express");
const { body, param, query } = require("express-validator");

const authenticate = require("../../middleware/authenticate");
const validate = require("../../middleware/validate");
const {
  requireConversationAccess,
} = require("../../middleware/collaborationAccess");

const controller = require("./messages.controller");

const router = express.Router();

router.use(authenticate);

router.get(
  "/:conversationId",
  [
    param("conversationId").isUUID(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  requireConversationAccess,
  controller.list
);

router.post(
  "/:conversationId",
  [
    param("conversationId").isUUID(),
    body("message").trim().notEmpty().isLength({ max: 10000 }),
    body("replyToId").optional({ nullable: true }).isUUID(),
  ],
  validate,
  requireConversationAccess,
  controller.send
);

router.patch(
  "/:conversationId/:messageId",
  [
    param("conversationId").isUUID(),
    param("messageId").isUUID(),
    body("message").trim().notEmpty().isLength({ max: 10000 }),
  ],
  validate,
  requireConversationAccess,
  controller.edit
);

router.delete(
  "/:conversationId/:messageId",
  [
    param("conversationId").isUUID(),
    param("messageId").isUUID(),
  ],
  validate,
  requireConversationAccess,
  controller.remove
);

router.post(
  "/:conversationId/read",
  [param("conversationId").isUUID()],
  validate,
  requireConversationAccess,
  controller.markRead
);

module.exports = router;

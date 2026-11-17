
const express = require("express");
const { body, param } = require("express-validator");

const authenticate = require("../../middleware/authenticate");
const validate = require("../../middleware/validate");
const {
  requireTaskCommentAccess,
} = require("../../middleware/collaborationAccess");

const controller = require("./comments.controller");

const router = express.Router();

router.use(authenticate);

router.get(
  "/:taskId",
  [param("taskId").isUUID()],
  validate,
  requireTaskCommentAccess,
  controller.list
);

router.post(
  "/:taskId",
  [
    param("taskId").isUUID(),
    body("content").trim().notEmpty().isLength({ max: 10000 }),
    body("parentId").optional({ nullable: true }).isUUID(),
  ],
  validate,
  requireTaskCommentAccess,
  controller.create
);

router.patch(
  "/:taskId/:commentId",
  [
    param("taskId").isUUID(),
    param("commentId").isUUID(),
    body("content").trim().notEmpty().isLength({ max: 10000 }),
  ],
  validate,
  requireTaskCommentAccess,
  controller.update
);

router.delete(
  "/:taskId/:commentId",
  [
    param("taskId").isUUID(),
    param("commentId").isUUID(),
  ],
  validate,
  requireTaskCommentAccess,
  controller.remove
);

module.exports = router;

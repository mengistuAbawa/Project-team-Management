
const express = require("express");
const { body, param } = require("express-validator");

const authenticate = require("../../middleware/authenticate");
const validate = require("../../middleware/validate");
const controller = require("./meetings.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", controller.list);

router.post(
  "/",
  [
    body("projectId").isUUID(),
    body("teamId").optional({ nullable: true }).isUUID(),
    body("title").trim().notEmpty().isLength({ max: 180 }),
    body("description").optional({ nullable: true }).isString(),
    body("meetingType").optional().isIn(["online", "in_person"]),
    body("meetingLink").optional({ nullable: true }).isURL({
      require_protocol: true,
    }),
    body("location").optional({ nullable: true }).isString(),
    body("startTime").isISO8601(),
    body("endTime").isISO8601(),
    body("participantIds").optional().isArray({ max: 100 }),
    body("participantIds.*").optional().isUUID(),
  ],
  validate,
  controller.create
);

router.get(
  "/:meetingId",
  [param("meetingId").isUUID()],
  validate,
  controller.getOne
);

router.patch(
  "/:meetingId/response",
  [
    param("meetingId").isUUID(),
    body("response").isIn(["accepted", "declined"]),
  ],
  validate,
  controller.respond
);

router.patch(
  "/:meetingId/status",
  [
    param("meetingId").isUUID(),
    body("status").isIn(["completed", "cancelled"]),
  ],
  validate,
  controller.updateStatus
);

module.exports = router;

const express = require("express");
const controller = require("./publicRequests.controller");
const validation = require("./publicRequests.validation");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const validate = require("../../middleware/validate");

const router = express.Router();

router.use(authenticate);
router.use(authorize("system_admin"));

router.get(
  "/contact-messages",
  validation.contactListValidation,
  validate,
  controller.listContactMessages
);
router.get(
  "/contact-messages/:id",
  validation.idValidation,
  validate,
  controller.getContactMessage
);
router.patch(
  "/contact-messages/:id/status",
  validation.contactStatusValidation,
  validate,
  controller.updateContactStatus
);

router.get(
  "/access-requests",
  validation.accessListValidation,
  validate,
  controller.listAccessRequests
);
router.get(
  "/access-requests/:id",
  validation.idValidation,
  validate,
  controller.getAccessRequest
);
router.patch(
  "/access-requests/:id/decision",
  validation.accessDecisionValidation,
  validate,
  controller.reviewAccessRequest
);

module.exports = router;

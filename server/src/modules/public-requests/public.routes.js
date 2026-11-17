const express = require("express");
const { rateLimit } = require("express-rate-limit");
const controller = require("./publicRequests.controller");
const validation = require("./publicRequests.validation");
const validate = require("../../middleware/validate");

function createSubmissionLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler(_req, res) {
      res.status(429).json({
        success: false,
        message: "Too many submissions. Please try again in 15 minutes."
      });
    }
  });
}

const router = express.Router();

router.post(
  "/contact",
  createSubmissionLimiter(),
  validation.publicContactValidation,
  validate,
  controller.createContactMessage
);

router.post(
  "/access-requests",
  createSubmissionLimiter(),
  validation.publicAccessRequestValidation,
  validate,
  controller.createAccessRequest
);

module.exports = router;

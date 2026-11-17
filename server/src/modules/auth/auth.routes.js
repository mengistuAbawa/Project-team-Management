const router = require("express").Router();
const { validationResult } = require("express-validator");
const controller = require("./auth.controller");
const { loginLimiter, invitationLimiter } = require("../../middleware/rateLimits");
const {
  loginValidation,
  acceptInvitationValidation
} = require("./auth.validation");
const authenticate = require("../../middleware/authenticate");

function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors.array()
    });
  }

  next();
}

router.post("/register", controller.register);
router.post(
  "/accept-invitation",
  invitationLimiter,
  acceptInvitationValidation,
  validate,
  controller.acceptInvitation
);
router.post("/login", loginLimiter, loginValidation, validate, controller.login);
router.get("/me", authenticate, controller.me);

module.exports = router;
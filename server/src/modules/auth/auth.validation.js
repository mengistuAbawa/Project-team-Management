const { body } = require("express-validator");

exports.acceptInvitationValidation = [
  body("token")
    .isString()
    .isLength({ min: 40, max: 100 })
    .withMessage("A valid invitation token is required."),
  body("password")
    .isString()
    .isLength({ min: 12, max: 128 })
    .withMessage("Password must contain between 12 and 128 characters.")
];

exports.loginValidation = [
  body("email").trim().isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 1, max: 128 })
];
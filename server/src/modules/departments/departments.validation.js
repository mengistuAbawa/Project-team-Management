const { body, param } = require("express-validator");

exports.createValidation = [
  body("organizationId")
    .isUUID()
    .withMessage("A valid organization ID is required."),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Department name is required.")
    .isLength({ max: 150 })
];

exports.updateValidation = [
  param("id").isUUID(),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: 150 }),

  body("organizationId")
    .optional()
    .isUUID()
];
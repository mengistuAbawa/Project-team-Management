const { body, param } = require("express-validator");

exports.createValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Organization name is required.")
    .isLength({ max: 180 }),

  body("description")
    .optional({ nullable: true })
    .isString()
];

exports.updateValidation = [
  param("id").isUUID(),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: 180 }),

  body("description")
    .optional({ nullable: true })
    .isString()
];
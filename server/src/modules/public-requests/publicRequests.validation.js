const { body, param, query } = require("express-validator");
const { ACCESS_REQUEST_ROLES } = require("../users/userSecurity");

function sanitizeText(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

const publicContactValidation = [
  body("fullName").customSanitizer(sanitizeText).isLength({ min: 2, max: 150 })
    .withMessage("Full name must be between 2 and 150 characters."),
  body("email").trim().normalizeEmail().isEmail().isLength({ max: 180 })
    .withMessage("A valid email address is required."),
  body("organization").customSanitizer(sanitizeText).isLength({ min: 2, max: 180 })
    .withMessage("Organization must be between 2 and 180 characters."),
  body("subject").customSanitizer(sanitizeText).isIn(["access", "information", "other"])
    .withMessage("Select a valid subject."),
  body("message").customSanitizer(sanitizeText).isLength({ min: 10, max: 3000 })
    .withMessage("Message must be between 10 and 3000 characters."),
  body("role").not().exists().withMessage("Access roles are assigned by an administrator.")
];

const publicAccessRequestValidation = [
  body("fullName").customSanitizer(sanitizeText).isLength({ min: 2, max: 150 })
    .withMessage("Full name must be between 2 and 150 characters."),
  body("email").trim().normalizeEmail().isEmail().isLength({ max: 180 })
    .withMessage("A valid email address is required."),
  body("organization").customSanitizer(sanitizeText).isLength({ min: 2, max: 180 })
    .withMessage("Organization must be between 2 and 180 characters."),
  body("jobTitle").customSanitizer(sanitizeText).isLength({ min: 2, max: 120 })
    .withMessage("Job title must be between 2 and 120 characters."),
  body("phone").optional({ nullable: true, checkFalsy: true })
    .customSanitizer(sanitizeText).isLength({ max: 30 })
    .withMessage("Phone number cannot exceed 30 characters."),
  body("reason").customSanitizer(sanitizeText).isLength({ min: 10, max: 3000 })
    .withMessage("Reason must be between 10 and 3000 characters."),
  body("role").not().exists().withMessage("Access roles are assigned by an administrator.")
];

const contactListValidation = [
  query("search").optional().trim().isLength({ max: 180 })
    .withMessage("Search text cannot exceed 180 characters."),
  query("status").optional().isIn(["new", "read", "closed"])
    .withMessage("Invalid contact status."),
  query("page").optional().isInt({ min: 1 }).toInt()
    .withMessage("Page must be a positive integer."),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt()
    .withMessage("Limit must be between 1 and 100.")
];

const accessListValidation = [
  query("search").optional().trim().isLength({ max: 180 })
    .withMessage("Search text cannot exceed 180 characters."),
  query("status").optional().isIn(["pending", "approved", "rejected"])
    .withMessage("Invalid access-request status."),
  query("page").optional().isInt({ min: 1 }).toInt()
    .withMessage("Page must be a positive integer."),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt()
    .withMessage("Limit must be between 1 and 100.")
];

const idValidation = [param("id").isUUID().withMessage("A valid request ID is required.")];

const contactStatusValidation = [
  ...idValidation,
  body("status").isIn(["new", "read", "closed"])
    .withMessage("Status must be new, read, or closed.")
];

const accessDecisionValidation = [
  ...idValidation,
  body("decision").isIn(["approved", "rejected"])
    .withMessage("Decision must be approved or rejected."),
  body("role").custom((value, { req }) => {
    if (req.body.decision === "approved" && !ACCESS_REQUEST_ROLES.includes(value)) {
      throw new Error("Approval requires an allowed non-administrator role.");
    }
    if (req.body.decision === "rejected" && value !== undefined) {
      throw new Error("A role must not be provided when rejecting a request.");
    }
    return true;
  }),
  body("reviewNote").optional({ nullable: true })
    .customSanitizer(sanitizeText).isLength({ max: 1000 })
    .withMessage("Review note cannot exceed 1000 characters.")
];

module.exports = {
  publicContactValidation,
  publicAccessRequestValidation,
  contactListValidation,
  accessListValidation,
  idValidation,
  contactStatusValidation,
  accessDecisionValidation
};

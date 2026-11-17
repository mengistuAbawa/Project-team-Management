
const { body, param, query } = require("express-validator");

const uuidParam = [
  param("id").isUUID().withMessage("A valid project ID is required"),
];

const projectIdParam = [
  param("projectId").isUUID().withMessage("A valid project ID is required"),
];

const createProjectValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ max: 150 })
    .withMessage("Project name cannot exceed 150 characters"),

  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("Description must be text"),

  body("organizationId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Organization ID must be a valid UUID"),

  body("startDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  body("dueDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Due date must be a valid date"),

  body("budget")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Budget must be zero or greater"),
];

const updateProjectValidation = [
  ...uuidParam,

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: 150 }),

  body("description")
    .optional({ nullable: true })
    .isString(),

  body("organizationId")
    .optional({ nullable: true })
    .isUUID(),

  body("startDate")
    .optional({ nullable: true })
    .isISO8601(),

  body("dueDate")
    .optional({ nullable: true })
    .isISO8601(),

  body("budget")
    .optional({ nullable: true })
    .isFloat({ min: 0 }),

  body("status")
    .optional()
    .isIn(["planning", "active", "on_hold", "completed", "cancelled"])
    .withMessage("Invalid project status"),
];

const listProjectsValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status")
    .optional()
    .isIn(["planning", "active", "on_hold", "completed", "cancelled"]),
];

const addMemberValidation = [
  ...projectIdParam,
  body("userId").isUUID().withMessage("A valid user ID is required"),
];

const removeMemberValidation = [
  ...projectIdParam,
  param("userId").isUUID().withMessage("A valid user ID is required"),
];

module.exports = {
  uuidParam,
  projectIdParam,
  createProjectValidation,
  updateProjectValidation,
  listProjectsValidation,
  addMemberValidation,
  removeMemberValidation,
};

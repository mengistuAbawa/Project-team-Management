
const { body, param, query } = require("express-validator");

const projectIdParam = [
  param("projectId").isUUID().withMessage("Invalid project ID"),
];

const taskIdParam = [
  param("taskId").isUUID().withMessage("Invalid task ID"),
];

const taskIdOnlyParam = [
  param("id").isUUID().withMessage("Invalid task ID"),
];

const createTaskValidation = [
  ...projectIdParam,

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ max: 180 })
    .withMessage("Task title cannot exceed 180 characters"),

  body("description")
    .optional({ nullable: true })
    .isString(),

  body("teamId")
    .optional({ nullable: true })
    .isUUID(),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"]),

  body("dueDate")
    .optional({ nullable: true })
    .isISO8601(),

  body("estimatedHours")
    .optional({ nullable: true })
    .isFloat({ min: 0 }),

  body("assigneeIds")
    .optional()
    .isArray({ max: 30 }),

  body("assigneeIds.*")
    .optional()
    .isUUID(),
];

const updateTaskValidation = [
  ...taskIdParam,

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: 180 }),

  body("description")
    .optional({ nullable: true })
    .isString(),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"]),

  body("dueDate")
    .optional({ nullable: true })
    .isISO8601(),

  body("estimatedHours")
    .optional({ nullable: true })
    .isFloat({ min: 0 }),

  body("actualHours")
    .optional({ nullable: true })
    .isFloat({ min: 0 }),
];

const updateStatusValidation = [
  ...taskIdParam,
  body("status")
    .isIn(["todo", "in_progress", "review", "done", "blocked"])
    .withMessage("Invalid task status"),
];

const assignValidation = [
  ...taskIdParam,
  body("userIds")
    .isArray({ min: 1, max: 30 })
    .withMessage("Provide one or more user IDs"),
  body("userIds.*").isUUID(),
];

const removeAssigneeValidation = [
  ...taskIdParam,
  param("userId").isUUID().withMessage("Invalid user ID"),
];

const subtaskValidation = [
  ...taskIdParam,
  body("title")
    .trim()
    .notEmpty()
    .isLength({ max: 180 }),
  body("description")
    .optional({ nullable: true })
    .isString(),
];

const subtaskUpdateValidation = [
  param("subtaskId").isUUID(),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: 180 }),
  body("isCompleted")
    .optional()
    .isBoolean(),
];

const dependencyValidation = [
  ...taskIdParam,
  body("dependsOnTaskId")
    .isUUID()
    .withMessage("A valid dependency task ID is required"),
];

const dependencyIdValidation = [
  ...taskIdParam,
  param("dependencyId").isUUID().withMessage("Invalid dependency ID"),
];

const qaReviewValidation = [
  ...taskIdParam,
  body("qaStatus")
    .isIn(["approved", "rejected", "changes_requested"])
    .withMessage("Invalid QA review status"),
  body("qaFeedback")
    .optional({ nullable: true })
    .isString(),
];

const listValidation = [
  ...projectIdParam,
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status")
    .optional()
    .isIn(["todo", "in_progress", "review", "done", "blocked"]),
  query("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"]),
];

module.exports = {
  projectIdParam,
  taskIdParam,
  taskIdOnlyParam,
  createTaskValidation,
  updateTaskValidation,
  updateStatusValidation,
  assignValidation,
  removeAssigneeValidation,
  subtaskValidation,
  subtaskUpdateValidation,
  dependencyValidation,
  dependencyIdValidation,
  qaReviewValidation,
  listValidation,
};

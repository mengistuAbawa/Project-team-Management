
const { body, param, query } = require("express-validator");

const projectIdParam = [
  param("projectId")
    .isUUID()
    .withMessage("A valid project ID is required"),
];

const teamIdParam = [
  param("teamId")
    .isUUID()
    .withMessage("A valid team ID is required"),
];

const teamIdOnlyParam = [
  param("id")
    .isUUID()
    .withMessage("A valid team ID is required"),
];

const createTeamValidation = [
  ...projectIdParam,

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Team name is required")
    .isLength({ max: 120 })
    .withMessage("Team name cannot exceed 120 characters"),

  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("Description must be text"),

  body("leaderId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Leader ID must be a valid UUID"),
];

const updateTeamValidation = [
  ...teamIdOnlyParam,

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: 120 }),

  body("description")
    .optional({ nullable: true })
    .isString(),
];

const assignLeaderValidation = [
  ...teamIdParam,

  body("leaderId")
    .isUUID()
    .withMessage("A valid team leader ID is required"),
];

const addMemberValidation = [
  ...teamIdParam,

  body("userId")
    .isUUID()
    .withMessage("A valid user ID is required"),
];

const removeMemberValidation = [
  ...teamIdParam,

  param("userId")
    .isUUID()
    .withMessage("A valid user ID is required"),
];

const listTeamsValidation = [
  ...projectIdParam,
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  projectIdParam,
  teamIdParam,
  teamIdOnlyParam,
  createTeamValidation,
  updateTeamValidation,
  assignLeaderValidation,
  addMemberValidation,
  removeMemberValidation,
  listTeamsValidation,
};

const { body, param, query } = require("express-validator");

const roles = [
  "system_admin",
  "project_manager",
  "team_leader",
  "team_member",
  "client",
  "qa_reviewer"
];

const roleAttributeKeys = {
  system_admin: ["administratorLevel", "administrativePermissions", "managedOrganizationIds"],
  project_manager: ["projectResponsibilities", "approvalScope"],
  team_leader: ["leadershipResponsibilities"],
  team_member: ["skills", "specialization", "experienceLevel", "availabilityStatus"],
  client: ["companyName", "clientCode", "contactPerson", "billingAddress", "contractReference", "clientContactInformation"],
  qa_reviewer: ["qaIdentificationCode", "qaSpecialization", "testingExpertise", "reviewResponsibilities"]
};

function validateCreateRoleAttributes(attributes, { req }) {
  if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) {
    throw new Error("Role attributes must be an object.");
  }
  const allowed = roleAttributeKeys[req.body.role] || [];
  if (Object.keys(attributes).some((key) => !allowed.includes(key))) {
    throw new Error("Role attributes do not match the selected role.");
  }

  for (const [key, value] of Object.entries(attributes)) {
    if (key === "managedOrganizationIds") {
      if (!Array.isArray(value) || value.some((id) =>
        typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
      )) {
        throw new Error("Managed organizations must be valid organization IDs.");
      }
      continue;
    }

    if (key === "administrativePermissions" || key === "skills" || key === "testingExpertise") {
      if (!Array.isArray(value) || value.length > 50 ||
          value.some((item) => typeof item !== "string" || item.trim().length > 100)) {
        throw new Error(`${key} must be a list of short text values.`);
      }
      continue;
    }

    if (typeof value !== "string" || value.trim().length > 2000) {
      throw new Error(`${key} must be text no longer than 2000 characters.`);
    }
    if (key === "experienceLevel" && !["entry", "intermediate", "senior", "expert"].includes(value)) {
      throw new Error("Invalid experience level.");
    }
    if (key === "availabilityStatus" && !["available", "part_time", "unavailable"].includes(value)) {
      throw new Error("Invalid availability status.");
    }
    if (key === "administratorLevel" && !["global", "organization"].includes(value)) {
      throw new Error("Invalid administrator level.");
    }
  }
  return true;
}

const validUuidList = (field) => [
  body(field).isArray({ max: 100 }).withMessage(`${field} must be a list of IDs.`),
  body(`${field}.*`).isUUID().withMessage(`Every ${field} value must be a valid ID.`)
];

exports.listUsersValidation = [
  query("role").optional().isIn(roles).withMessage("Invalid role filter."),
  query("organizationId").optional().isUUID(),
  query("departmentId").optional().isUUID(),
  query("status").optional().isIn(["active", "inactive", "suspended"]),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 })
];

exports.createUserValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required.").isLength({ max: 150 }),
  body("email").trim().isEmail().isLength({ max: 180 }).withMessage("Valid email is required.").normalizeEmail(),
  body("phone").optional({ nullable: true }).isString().isLength({ max: 30 }),
  body("role").isIn(roles).withMessage("Invalid user role."),
  body("organizationId").optional({ nullable: true, checkFalsy: true }).isUUID(),
  body("departmentId").optional({ nullable: true, checkFalsy: true }).isUUID(),
  body("avatarUrl").optional({ nullable: true, checkFalsy: true })
    .isURL({ protocols: ["http", "https"], require_protocol: true }).withMessage("Profile image must be an HTTP or HTTPS URL."),
  body("jobTitle").optional({ nullable: true }).isString().isLength({ max: 150 }),
  body("employeeCode").optional({ nullable: true }).isString().isLength({ max: 80 }),
  body("projectId").optional({ nullable: true, checkFalsy: true }).isUUID(),
  body("teamId").optional({ nullable: true, checkFalsy: true }).isUUID(),
  body("projectIds").optional().isArray({ max: 100 }),
  body("projectIds.*").optional().isUUID(),
  body("teamIds").optional().isArray({ max: 100 }),
  body("teamIds.*").optional().isUUID(),
  body("roleAttributes").optional().custom(validateCreateRoleAttributes),
  body("accountActive").optional().isBoolean().toBoolean(),
  body("confirmSystemAdmin").optional().isBoolean().toBoolean(),
  body().custom((_, { req }) => {
    if (req.body.role === "system_admin" && req.body.confirmSystemAdmin !== true) {
      throw new Error("Confirm global administrator privileges before creating this account.");
    }
    return true;
  })
];

exports.updateUserValidation = [
  param("id").isUUID().withMessage("Invalid user ID."),
  body("fullName").optional().trim().notEmpty().isLength({ max: 150 }),
  body("email").optional().trim().isEmail().isLength({ max: 180 }).withMessage("Valid email is required.").normalizeEmail(),
  body("phone").optional({ nullable: true }).isString().isLength({ max: 30 }),
  body("avatarUrl").optional({ nullable: true, checkFalsy: true })
    .isURL({ protocols: ["http", "https"], require_protocol: true }).withMessage("Profile image must be an HTTP or HTTPS URL."),
  body("organizationId").optional({ nullable: true, checkFalsy: true }).isUUID(),
  body("departmentId").optional({ nullable: true, checkFalsy: true }).isUUID(),
  body("jobTitle").optional({ nullable: true }).isString().isLength({ max: 150 }),
  body("employeeCode").optional({ nullable: true }).isString().isLength({ max: 80 }),
  body("roleAttributes").optional().isObject().withMessage("Role attributes must be an object."),
  body("isActive").optional().isBoolean().toBoolean()
];

exports.assignRoleValidation = [
  param("id").isUUID().withMessage("Invalid user ID."),
  body("role").isIn(roles).withMessage("Invalid role."),
  body("confirmSystemAdmin").optional().isBoolean().toBoolean(),
  body().custom((_, { req }) => {
    if (req.body.role === "system_admin" && req.body.confirmSystemAdmin !== true) {
      throw new Error("Confirm global administrator privileges before assigning this role.");
    }
    return true;
  })
];

exports.assignProjectsValidation = [
  param("id").isUUID().withMessage("Invalid user ID."),
  ...validUuidList("projectIds"),
  body("projectIds").isArray({ min: 1, max: 100 }).withMessage("Select one or more projects.")
];

exports.assignTeamsValidation = [
  param("id").isUUID().withMessage("Invalid user ID."),
  ...validUuidList("teamIds"),
  body("teamIds").isArray({ min: 1, max: 100 }).withMessage("Select one or more teams.")
];

exports.userIdValidation = [
  param("id").isUUID().withMessage("Invalid user ID.")
];

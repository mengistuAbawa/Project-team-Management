
const router = require("express").Router();

const controller = require("./users.controller");
const validation = require("./users.validation");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const validate = require("../../middleware/validate");

router.use(authenticate);
router.use(authorize("system_admin"));

router.get("/", validation.listUsersValidation, validate, controller.list);
router.get("/stats", controller.stats);
router.get("/invitations", controller.listInvitations);
router.post(
  "/invitations/:id/resend",
  validation.userIdValidation,
  validate,
  controller.resendInvitation
);

router.post(
  "/",
  validation.createUserValidation,
  validate,
  controller.create
);
router.post(
  "/invitations",
  validation.createUserValidation,
  validate,
  controller.create
);

router.get("/:id", validation.userIdValidation, validate, controller.getOne);
router.get(
  "/:id/assignments",
  validation.userIdValidation,
  validate,
  controller.assignments
);

router.patch(
  "/:id",
  validation.updateUserValidation,
  validate,
  controller.update
);

router.patch(
  "/:id/role",
  validation.assignRoleValidation,
  validate,
  controller.assignRole
);

router.patch("/:id/deactivate", validation.userIdValidation, validate, controller.deactivate);
router.patch("/:id/activate", validation.userIdValidation, validate, controller.activate);
router.patch("/:id/suspend", validation.userIdValidation, validate, controller.suspend);

router.post(
  "/:id/projects",
  validation.assignProjectsValidation,
  validate,
  controller.assignProjects
);
router.post(
  "/:id/teams",
  validation.assignTeamsValidation,
  validate,
  controller.assignTeams
);

module.exports = router;

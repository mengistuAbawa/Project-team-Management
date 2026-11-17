const router = require("express").Router();

const controller = require("./departments.controller");
const validation = require("./departments.validation");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const validate = require("../../middleware/validate");

router.use(authenticate);
router.use(authorize("system_admin"));

router.get("/", controller.list);
router.get("/:id", controller.getOne);

router.post(
  "/",
  validation.createValidation,
  validate,
  controller.create
);

router.patch(
  "/:id",
  validation.updateValidation,
  validate,
  controller.update
);

router.delete("/:id", controller.remove);

module.exports = router;
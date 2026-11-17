const router = require("express").Router();

const controller = require("./roles.controller");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.use(authenticate);
router.use(authorize("system_admin"));

router.get("/", controller.list);

module.exports = router;
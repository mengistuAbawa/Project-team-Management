
const express = require("express");
const router = express.Router();
const db = require("../config/database");
const logger = require("../utils/logger");

router.use("/public", require("../modules/public-requests/public.routes"));
router.use(
  "/admin/public-requests",
  require("../modules/public-requests/admin.routes")
);

// Authentication and administration.
router.use("/auth", require("../modules/auth/auth.routes"));
router.use("/users", require("../modules/users/users.routes"));
router.use("/roles", require("../modules/roles/roles.routes"));
router.use("/organizations", require("../modules/organizations/organizations.routes"));
router.use("/departments", require("../modules/departments/departments.routes"));

// Projects and teams.
router.use("/projects", require("../modules/projects/projects.routes"));

const teamRoutes = require("../modules/teams/teams.routes");
router.use("/projects/:projectId/teams", teamRoutes.projectRouter);
router.use("/teams", teamRoutes.teamRouter);

// Tasks.
const taskRoutes = require("../modules/tasks/tasks.routes");
router.use("/projects/:projectId/tasks", taskRoutes.projectRouter);
router.use("/tasks", taskRoutes.taskRouter);

// Phase 6: communication and collaboration.
router.use(
  "/conversations",
  require("../modules/conversations/conversations.routes")
);

router.use(
  "/conversations",
  require("../modules/messages/messages.routes")
);

router.use(
  "/tasks",
  require("../modules/task-comments/comments.routes")
);

router.use(
  "/meetings",
  require("../modules/meetings/meetings.routes")
);

router.get("/health/live", (req, res) => {
  res.status(200).json({
    success: true,
    status: "live"
  });
});

async function readiness(_req, res) {
  try {
    await db.query("SELECT 1");
    res.status(200).json({ success: true, status: "ready" });
  } catch (error) {
    logger.error("health_database_check_failed", {
      code: error.code || "unknown"
    });
    res.status(503).json({ success: false, status: "not_ready" });
  }
}

router.get("/health/ready", readiness);
router.get("/health", readiness);

module.exports = router;

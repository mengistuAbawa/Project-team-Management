
const express = require("express");

const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const validate = require("../../middleware/validate");

const {
  requireProjectAccess,
  requireProjectManager,
} = require("../../middleware/projectAccess");

const {
  requireTaskAccess,
  requireTaskManager,
  requireTaskAssignee,
  requireQaAssignee,
} = require("../../middleware/taskAccess");

const controller = require("./tasks.controller");

const {
  projectIdParam,
  taskIdParam,
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
} = require("./tasks.validation");

// /api/v1/projects/:projectId/tasks
const projectRouter = express.Router({ mergeParams: true });

projectRouter.use(authenticate);

projectRouter.get(
  "/",
  listValidation,
  validate,
  requireProjectAccess,
  controller.list
);

projectRouter.post(
  "/",
  projectIdParam,
  createTaskValidation,
  validate,
  requireProjectAccess,
  authorize("system_admin", "project_manager", "team_leader"),
  controller.create
);

// /api/v1/tasks/:taskId
const taskRouter = express.Router();

taskRouter.use(authenticate);

taskRouter.get(
  "/:taskId",
  taskIdParam,
  validate,
  requireTaskAccess,
  controller.getOne
);

taskRouter.patch(
  "/:taskId",
  taskIdParam,
  updateTaskValidation,
  validate,
  requireTaskAccess,
  requireTaskManager,
  controller.update
);

taskRouter.patch(
  "/:taskId/status",
  taskIdParam,
  updateStatusValidation,
  validate,
  requireTaskAccess,
  requireTaskAssignee,
  controller.updateStatus
);

taskRouter.delete(
  "/:taskId",
  taskIdParam,
  validate,
  requireTaskAccess,
  requireTaskManager,
  controller.remove
);

// Assignment management.
taskRouter.put(
  "/:taskId/assignees",
  assignValidation,
  validate,
  requireTaskAccess,
  requireTaskManager,
  controller.assign
);

taskRouter.delete(
  "/:taskId/assignees/:userId",
  removeAssigneeValidation,
  validate,
  requireTaskAccess,
  requireTaskManager,
  controller.removeAssignee
);

// Subtasks.
taskRouter.get(
  "/:taskId/subtasks",
  taskIdParam,
  validate,
  requireTaskAccess,
  controller.subtasks
);

taskRouter.post(
  "/:taskId/subtasks",
  subtaskValidation,
  validate,
  requireTaskAccess,
  requireTaskManager,
  controller.createSubtask
);

taskRouter.patch(
  "/:taskId/subtasks/:subtaskId",
  taskIdParam,
  subtaskUpdateValidation,
  validate,
  requireTaskAccess,
  requireTaskAssignee,
  controller.updateSubtask
);

taskRouter.delete(
  "/:taskId/subtasks/:subtaskId",
  taskIdParam,
  validate,
  requireTaskAccess,
  requireTaskManager,
  controller.deleteSubtask
);

// Dependencies.
taskRouter.get(
  "/:taskId/dependencies",
  taskIdParam,
  validate,
  requireTaskAccess,
  controller.dependencies
);

taskRouter.post(
  "/:taskId/dependencies",
  dependencyValidation,
  validate,
  requireTaskAccess,
  requireTaskManager,
  controller.addDependency
);

taskRouter.delete(
  "/:taskId/dependencies/:dependencyId",
  dependencyIdValidation,
  validate,
  requireTaskAccess,
  requireTaskManager,
  controller.removeDependency
);

// QA review.
taskRouter.patch(
  "/:taskId/qa-review",
  qaReviewValidation,
  validate,
  requireTaskAccess,
  requireQaAssignee,
  controller.review
);

module.exports = {
  projectRouter,
  taskRouter,
};

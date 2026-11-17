
const asyncHandler = require("../../utils/asyncHandler");
const service = require("./tasks.service");

const create = asyncHandler(async (req, res) => {
  const task = await service.createTask(
    req.params.projectId,
    req.body,
    req.user
  );

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: task,
  });
});

const list = asyncHandler(async (req, res) => {
  const result = await service.listTasks(
    req.params.projectId,
    {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      priority: req.query.priority,
      teamId: req.query.teamId,
      assigneeId: req.query.assigneeId,
      search: req.query.search,
    },
    req.user
  );

  res.status(200).json({
    success: true,
    data: result.tasks,
    pagination: result.pagination,
  });
});

const getOne = asyncHandler(async (req, res) => {
  const task = await service.getTask(req.params.taskId);

  res.status(200).json({
    success: true,
    data: task,
  });
});

const update = asyncHandler(async (req, res) => {
  const task = await service.updateTask(req.params.taskId, req.body);

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: task,
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const task = await service.updateTaskStatus(
    req.params.taskId,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: "Task status updated successfully",
    data: task,
  });
});

const assign = asyncHandler(async (req, res) => {
  const task = await service.assignUsers(
    req.params.taskId,
    req.body.userIds,
    req.user
  );

  res.status(200).json({
    success: true,
    message: "Task assignees updated successfully",
    data: task,
  });
});

const removeAssignee = asyncHandler(async (req, res) => {
  const result = await service.removeAssignee(
    req.params.taskId,
    req.params.userId
  );

  res.status(200).json({
    success: true,
    message: "Task assignee removed successfully",
    data: result,
  });
});

const remove = asyncHandler(async (req, res) => {
  const result = await service.deleteTask(req.params.taskId);

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
    data: result,
  });
});

const subtasks = asyncHandler(async (req, res) => {
  const result = await service.listSubtasks(req.params.taskId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const createSubtask = asyncHandler(async (req, res) => {
  const result = await service.createSubtask(
    req.params.taskId,
    req.body,
    req.user
  );

  res.status(201).json({
    success: true,
    message: "Subtask created successfully",
    data: result,
  });
});

const updateSubtask = asyncHandler(async (req, res) => {
  const result = await service.updateSubtask(
    req.params.taskId,
    req.params.subtaskId,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Subtask updated successfully",
    data: result,
  });
});

const deleteSubtask = asyncHandler(async (req, res) => {
  const result = await service.deleteSubtask(
    req.params.taskId,
    req.params.subtaskId
  );

  res.status(200).json({
    success: true,
    message: "Subtask deleted successfully",
    data: result,
  });
});

const addDependency = asyncHandler(async (req, res) => {
  const result = await service.addDependency(
    req.params.taskId,
    req.body.dependsOnTaskId,
    req.user
  );

  res.status(201).json({
    success: true,
    message: "Task dependency added",
    data: result,
  });
});

const dependencies = asyncHandler(async (req, res) => {
  const result = await service.listDependencies(req.params.taskId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const removeDependency = asyncHandler(async (req, res) => {
  const result = await service.removeDependency(
    req.params.taskId,
    req.params.dependencyId
  );

  res.status(200).json({
    success: true,
    message: "Task dependency removed",
    data: result,
  });
});

const review = asyncHandler(async (req, res) => {
  const result = await service.reviewTask(
    req.params.taskId,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "QA review submitted successfully",
    data: result,
  });
});

module.exports = {
  create,
  list,
  getOne,
  update,
  updateStatus,
  assign,
  removeAssignee,
  remove,
  subtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  addDependency,
  dependencies,
  removeDependency,
  review,
};

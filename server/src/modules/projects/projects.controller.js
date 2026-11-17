
const asyncHandler = require("../../utils/asyncHandler");
const projectService = require("./projects.service");

const create = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: project,
  });
});

const list = asyncHandler(async (req, res) => {
  const result = await projectService.listProjects(req.user, {
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    search: req.query.search,
  });

  res.status(200).json({
    success: true,
    data: result.projects,
    pagination: result.pagination,
  });
});

const getOne = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id);

  res.status(200).json({
    success: true,
    data: project,
  });
});

const update = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: project,
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const project = await projectService.changeProjectStatus(
    req.params.id,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: "Project status updated successfully",
    data: project,
  });
});

const members = asyncHandler(async (req, res) => {
  const result = await projectService.listProjectMembers(
    req.params.projectId
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

const addMember = asyncHandler(async (req, res) => {
  const result = await projectService.addProjectMember(
    req.params.projectId,
    req.body.userId
  );

  res.status(result.added ? 201 : 200).json({
    success: true,
    message: result.added
      ? "Project member added successfully"
      : "User is already a project member",
    data: result.membership,
  });
});

const removeMember = asyncHandler(async (req, res) => {
  const result = await projectService.removeProjectMember(
    req.params.projectId,
    req.params.userId,
    req.user
  );

  res.status(200).json({
    success: true,
    message: "Project member removed successfully",
    data: result,
  });
});

module.exports = {
  create,
  list,
  getOne,
  update,
  updateStatus,
  members,
  addMember,
  removeMember,
};

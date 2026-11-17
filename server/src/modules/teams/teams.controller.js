
const asyncHandler = require("../../utils/asyncHandler");
const service = require("./teams.service");

const create = asyncHandler(async (req, res) => {
  const team = await service.createTeam(req.params.projectId, req.body);

  res.status(201).json({
    success: true,
    message: "Team created successfully",
    data: team,
  });
});

const list = asyncHandler(async (req, res) => {
  const result = await service.listTeams(req.params.projectId, {
    page: req.query.page,
    limit: req.query.limit,
  });

  res.status(200).json({
    success: true,
    data: result.teams,
    pagination: result.pagination,
  });
});

const getOne = asyncHandler(async (req, res) => {
  const team = await service.getTeam(req.params.teamId);

  res.status(200).json({
    success: true,
    data: team,
  });
});

const update = asyncHandler(async (req, res) => {
  const team = await service.updateTeam(req.params.teamId, req.body);

  res.status(200).json({
    success: true,
    message: "Team updated successfully",
    data: team,
  });
});

const assignLeader = asyncHandler(async (req, res) => {
  const result = await service.assignLeader(
    req.params.teamId,
    req.body.leaderId
  );

  res.status(200).json({
    success: true,
    message: "Team leader assigned successfully",
    data: result,
  });
});

const addMember = asyncHandler(async (req, res) => {
  const result = await service.addMember(
    req.params.teamId,
    req.body.userId
  );

  res.status(result.added ? 201 : 200).json({
    success: true,
    message: result.added
      ? "Team member added successfully"
      : "User is already a team member",
    data: result.membership,
  });
});

const listMembers = asyncHandler(async (req, res) => {
  const members = await service.listMembers(req.params.teamId);

  res.status(200).json({
    success: true,
    data: members,
  });
});

const removeMember = asyncHandler(async (req, res) => {
  const result = await service.removeMember(
    req.params.teamId,
    req.params.userId
  );

  res.status(200).json({
    success: true,
    message: "Team member removed successfully",
    data: result,
  });
});

const removeTeam = asyncHandler(async (req, res) => {
  const result = await service.deleteTeam(req.params.teamId);

  res.status(200).json({
    success: true,
    message: "Team deleted successfully",
    data: result,
  });
});

module.exports = {
  create,
  list,
  getOne,
  update,
  assignLeader,
  addMember,
  listMembers,
  removeMember,
  removeTeam,
};

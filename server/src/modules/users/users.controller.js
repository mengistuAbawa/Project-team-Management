
const service = require("./users.service");

exports.list = async (req, res) => {
  const result = await service.listUsers(req.query);

  res.json({
    success: true,
    data: result.users,
    pagination: result.pagination
  });
};

exports.stats = async (_req, res) => {
  const stats = await service.getUserStats();
  res.json({ success: true, data: stats });
};

exports.listInvitations = async (_req, res) => {
  const invitations = await service.listPendingInvitations();
  res.json({ success: true, data: invitations });
};

exports.resendInvitation = async (req, res) => {
  const invitation = await service.resendInvitation(req.params.id, req.user.id);
  res.json({
    success: true,
    message: "A replacement invitation link was created. Deliver it securely.",
    data: invitation
  });
};

exports.getOne = async (req, res) => {
  const user = await service.getUserById(req.params.id);

  res.json({
    success: true,
    data: user
  });
};

exports.assignProjects = async (req, res) => {
  const projectIds = await service.assignUserProjects(
    req.params.id,
    req.body.projectIds,
    req.user.id
  );
  res.json({
    success: true,
    message: "Project assignments updated successfully.",
    data: { projectIds }
  });
};

exports.assignTeams = async (req, res) => {
  const teamIds = await service.assignUserTeams(
    req.params.id,
    req.body.teamIds,
    req.user.id
  );
  res.json({
    success: true,
    message: "Team assignments updated successfully.",
    data: { teamIds }
  });
};

exports.assignments = async (req, res) => {
  const assignments = await service.getUserAssignments(req.params.id);
  res.json({ success: true, data: assignments });
};

exports.create = async (req, res) => {
  const invitation = await service.createInvitation(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: "Invitation created. Copy and deliver the link securely; it is shown only once.",
    data: invitation
  });
};

exports.update = async (req, res) => {
  const user = await service.updateUser(req.params.id, req.body, req.user.id);

  res.json({
    success: true,
    message: "User updated successfully.",
    data: user
  });
};

exports.assignRole = async (req, res) => {
  const user = await service.assignRole(
    req.params.id,
    req.body.role,
    req.user.id,
    req.body.confirmSystemAdmin
  );

  res.json({
    success: true,
    message: "User role updated successfully.",
    data: user
  });
};

exports.deactivate = async (req, res) => {
  const user = await service.setUserStatus(
    req.params.id,
    false,
    req.user.id
  );

  res.json({
    success: true,
    message: "User deactivated successfully.",
    data: user
  });
};

exports.activate = async (req, res) => {
  const user = await service.setUserStatus(
    req.params.id,
    true,
    req.user.id
  );

  res.json({
    success: true,
    message: "User activated successfully.",
    data: user
  });
};

exports.suspend = async (req, res) => {
  const user = await service.setUserStatus(
    req.params.id,
    "suspended",
    req.user.id
  );

  res.json({
    success: true,
    message: "User suspended successfully.",
    data: user
  });
};

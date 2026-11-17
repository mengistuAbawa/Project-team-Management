const authService = require("./auth.service");
const userService = require("../users/users.service");

exports.register = async (req, res) => {
  res.status(410).json({
    success: false,
    message: "Public registration is disabled. Ask a system administrator for an invitation."
  });
};

exports.acceptInvitation = async (req, res) => {
  const result = await userService.acceptInvitation(req.body);
  res.status(201).json({
    success: true,
    message: result.token
      ? "Invitation accepted. Your account is ready."
      : "Invitation accepted. Contact a system administrator to activate your account.",
    data: result
  });
};

exports.login = async (req, res) => {
  const result = await authService.login(req.body, req.requestId);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: result
  });
};

exports.me = async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  res.json({
    success: true,
    data: { user }
  });
};
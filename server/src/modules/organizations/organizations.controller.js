const service = require("./organizations.service");

exports.list = async (req, res) => {
  const organizations = await service.list();

  res.json({
    success: true,
    data: organizations
  });
};

exports.getOne = async (req, res) => {
  const organization = await service.getById(req.params.id);

  res.json({
    success: true,
    data: organization
  });
};

exports.create = async (req, res) => {
  const organization = await service.create(req.body);

  res.status(201).json({
    success: true,
    message: "Organization created successfully.",
    data: organization
  });
};

exports.update = async (req, res) => {
  const organization = await service.update(
    req.params.id,
    req.body
  );

  res.json({
    success: true,
    message: "Organization updated successfully.",
    data: organization
  });
};

exports.remove = async (req, res) => {
  await service.remove(req.params.id);

  res.json({
    success: true,
    message: "Organization deleted successfully."
  });
};
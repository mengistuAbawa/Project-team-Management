const service = require("./departments.service");

exports.list = async (req, res) => {
  const departments = await service.list(req.query.organizationId);

  res.json({
    success: true,
    data: departments
  });
};

exports.getOne = async (req, res) => {
  const department = await service.getById(req.params.id);

  res.json({
    success: true,
    data: department
  });
};

exports.create = async (req, res) => {
  const department = await service.create(req.body);

  res.status(201).json({
    success: true,
    message: "Department created successfully.",
    data: department
  });
};

exports.update = async (req, res) => {
  const department = await service.update(
    req.params.id,
    req.body
  );

  res.json({
    success: true,
    message: "Department updated successfully.",
    data: department
  });
};

exports.remove = async (req, res) => {
  await service.remove(req.params.id);

  res.json({
    success: true,
    message: "Department deleted successfully."
  });
};
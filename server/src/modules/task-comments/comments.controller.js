
const asyncHandler = require("../../utils/asyncHandler");
const service = require("./comments.service");

const list = asyncHandler(async (req, res) => {
  const result = await service.list(req.params.taskId);

  res.status(200).json({ success: true, data: result });
});

const create = asyncHandler(async (req, res) => {
  const result = await service.create(
    req.params.taskId,
    req.user.id,
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: result,
  });
});

const update = asyncHandler(async (req, res) => {
  const result = await service.update(
    req.params.commentId,
    req.user.id,
    req.body.content
  );

  res.status(200).json({
    success: true,
    message: "Comment updated successfully",
    data: result,
  });
});

const remove = asyncHandler(async (req, res) => {
  const result = await service.remove(
    req.params.commentId,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
    data: result,
  });
});

module.exports = { list, create, update, remove };

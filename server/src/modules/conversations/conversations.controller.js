
const asyncHandler = require("../../utils/asyncHandler");
const service = require("./conversations.service");

const create = asyncHandler(async (req, res) => {
  const result = await service.createConversation(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "Conversation created successfully",
    data: result,
  });
});

const list = asyncHandler(async (req, res) => {
  const result = await service.listConversations(req.user.id);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const getOne = asyncHandler(async (req, res) => {
  const result = await service.getConversation(
    req.params.conversationId,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

const addMembers = asyncHandler(async (req, res) => {
  const result = await service.addMembers(
    req.params.conversationId,
    req.body.memberIds,
    req.user
  );

  res.status(200).json({
    success: true,
    message: "Conversation members updated",
    data: result,
  });
});

const leave = asyncHandler(async (req, res) => {
  const result = await service.leaveConversation(
    req.params.conversationId,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: "You left the conversation",
    data: result,
  });
});

module.exports = { create, list, getOne, addMembers, leave };


const asyncHandler = require("../../utils/asyncHandler");
const service = require("./messages.service");
const { getIO } = require("../../config/socket");

const list = asyncHandler(async (req, res) => {
  const result = await service.listMessages(
    req.params.conversationId,
    req.user.id,
    Number(req.query.page) || 1,
    Number(req.query.limit) || 30
  );

  res.status(200).json({
    success: true,
    data: result.messages,
    pagination: result.pagination,
  });
});

const send = asyncHandler(async (req, res) => {
  const message = await service.sendMessage(
    req.params.conversationId,
    req.user.id,
    req.body
  );

  getIO().to(`conversation:${req.params.conversationId}`)
    .emit("message:new", message);

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: message,
  });
});

const edit = asyncHandler(async (req, res) => {
  const message = await service.editMessage(
    req.params.messageId,
    req.user.id,
    req.body.message
  );

  getIO().to(`conversation:${req.params.conversationId}`)
    .emit("message:updated", message);

  res.status(200).json({
    success: true,
    message: "Message updated successfully",
    data: message,
  });
});

const remove = asyncHandler(async (req, res) => {
  const message = await service.deleteMessage(
    req.params.messageId,
    req.user.id
  );

  getIO().to(`conversation:${req.params.conversationId}`)
    .emit("message:deleted", message);

  res.status(200).json({
    success: true,
    message: "Message deleted successfully",
    data: message,
  });
});

const markRead = asyncHandler(async (req, res) => {
  const result = await service.markConversationRead(
    req.params.conversationId,
    req.user.id
  );

  getIO().to(`conversation:${req.params.conversationId}`)
    .emit("conversation:read", {
      conversationId: req.params.conversationId,
      userId: req.user.id,
    });

  res.status(200).json({
    success: true,
    data: result,
  });
});

module.exports = { list, send, edit, remove, markRead };


const asyncHandler = require("../../utils/asyncHandler");
const service = require("./meetings.service");

const create = asyncHandler(async (req, res) => {
  const meeting = await service.create(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "Meeting scheduled successfully",
    data: meeting,
  });
});

const list = asyncHandler(async (req, res) => {
  const meetings = await service.listForUser(req.user.id);

  res.status(200).json({
    success: true,
    data: meetings,
  });
});

const getOne = asyncHandler(async (req, res) => {
  const meeting = await service.getOne(
    req.params.meetingId,
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    data: meeting,
  });
});

const respond = asyncHandler(async (req, res) => {
  const result = await service.respond(
    req.params.meetingId,
    req.user.id,
    req.body.response
  );

  res.status(200).json({
    success: true,
    message: "Meeting response saved",
    data: result,
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const result = await service.updateStatus(
    req.params.meetingId,
    req.user,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: "Meeting status updated",
    data: result,
  });
});

module.exports = { create, list, getOne, respond, updateStatus };

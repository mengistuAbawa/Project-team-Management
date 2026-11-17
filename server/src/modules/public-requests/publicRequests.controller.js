const asyncHandler = require("../../utils/asyncHandler");
const service = require("./publicRequests.service");

exports.createContactMessage = asyncHandler(async (req, res) => {
  const message = await service.createContactMessage(req.body);
  res.status(201).json({
    success: true,
    message: "Your message has been received.",
    data: message
  });
});

exports.createAccessRequest = asyncHandler(async (req, res) => {
  const request = await service.createAccessRequest(req.body);
  res.status(201).json({
    success: true,
    message: "Your access request has been submitted for administrator review.",
    data: request
  });
});

exports.listContactMessages = asyncHandler(async (req, res) => {
  const result = await service.listContactMessages(req.query);
  res.json({ success: true, data: result.items, pagination: result.pagination });
});

exports.getContactMessage = asyncHandler(async (req, res) => {
  const message = await service.getContactMessage(req.params.id);
  res.json({ success: true, data: message });
});

exports.updateContactStatus = asyncHandler(async (req, res) => {
  const message = await service.updateContactStatus(req.params.id, req.body.status, req.user.id);
  res.json({ success: true, message: "Contact message status updated.", data: message });
});

exports.listAccessRequests = asyncHandler(async (req, res) => {
  const result = await service.listAccessRequests(req.query);
  res.json({ success: true, data: result.items, pagination: result.pagination });
});

exports.getAccessRequest = asyncHandler(async (req, res) => {
  const request = await service.getAccessRequest(req.params.id);
  res.json({ success: true, data: request });
});

exports.reviewAccessRequest = asyncHandler(async (req, res) => {
  const result = await service.reviewAccessRequest(
    req.params.id,
    req.body,
    req.user.id
  );
  res.json({
    success: true,
    message: req.body.decision === "approved"
      ? "Access request approved. Deliver the invitation link securely; it is shown only once."
      : "Access request rejected.",
    data: {
      request: result.request,
      ...(result.invitation ? { invitation: result.invitation } : {})
    }
  });
});

const { rateLimit } = require("express-rate-limit");

function createLimiter(limit, message) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler(_req, res) {
      res.status(429).json({ success: false, message });
    }
  });
}

module.exports = {
  loginLimiter: createLimiter(10, "Too many login attempts. Please try again later."),
  invitationLimiter: createLimiter(5, "Too many invitation attempts. Please try again later.")
};

const jwt = require("jsonwebtoken");
const db = require("../config/database");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const env = require("../config/env");

module.exports = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication token is required.");
  }

  const token = header.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
  } catch {
    throw new ApiError(401, "Invalid or expired authentication token.");
  }

  if (!decoded || typeof decoded !== "object" || typeof decoded.sub !== "string") {
    throw new ApiError(401, "Invalid or expired authentication token.");
  }

  const result = await db.query(
    `SELECT u.id, u.full_name, u.email, u.is_active,
            r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1`,
    [decoded.sub]
  );

  if (!result.rows.length || !result.rows[0].is_active) {
    throw new ApiError(401, "User account is unavailable.");
  }

  req.user = result.rows[0];
  next();
});
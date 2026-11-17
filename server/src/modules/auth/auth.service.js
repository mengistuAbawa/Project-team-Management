const bcrypt = require("bcryptjs");
const db = require("../../config/database");
const ApiError = require("../../utils/ApiError");
const generateToken = require("../../utils/generateToken");
const logger = require("../../utils/logger");

async function login({ email, password }, requestId) {
  const result = await db.query(
    `SELECT u.id, u.full_name, u.email, u.password_hash,
            u.is_active, r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = $1`,
    [email]
  );

  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    logger.warn("auth.login_failed", { requestId });
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.is_active) {
    logger.warn("auth.login_blocked", { requestId });
    throw new ApiError(403, "Your account has been deactivated.");
  }

  const token = generateToken(user);
  const { password_hash: _passwordHash, ...safeUser } = user;
  return { user: safeUser, token };
}

async function getCurrentUser(userId) {
  const result = await db.query(
    `SELECT u.id, u.full_name, u.email, u.phone,
            u.avatar_url, u.is_active, u.created_at,
            r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1`,
    [userId]
  );

  if (!result.rows.length) {
    throw new ApiError(404, "User not found.");
  }

  return result.rows[0];
}

module.exports = { login, getCurrentUser };
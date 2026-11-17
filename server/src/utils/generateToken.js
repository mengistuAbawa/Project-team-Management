const jwt = require("jsonwebtoken");
const env = require("../config/env");

module.exports = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn, algorithm: "HS256" }
  );
};
const env = require("../config/env");
const logger = require("../utils/logger");

module.exports = (error, req, res, next) => {
  const statusCode = error.statusCode || error.status || 500;
  const isInternalError = statusCode >= 500;
  const requestId = req.requestId;

  if (env.nodeEnv !== "production") {
    logger.error("api_error", {
      requestId,
      name: error.name,
      statusCode,
      ...(error.code ? { code: error.code } : {})
    });
  } else if (isInternalError) {
    const errorContext = {
      requestId,
      name: error.name,
      ...(error.code ? { code: error.code } : {}),
      ...(error.constraint ? { constraint: error.constraint } : {}),
      ...(error.table ? { table: error.table } : {}),
      ...(error.column ? { column: error.column } : {}),
      ...(error.stack ? { stack: error.stack.split("\n").slice(1).join("\n") } : {})
    };
    logger.error("internal_api_error", errorContext);
  }

  res.status(statusCode).json({
    success: false,
    message: error.type === "entity.too.large"
      ? "Request body exceeds the allowed size."
      : isInternalError
        ? "Internal server error."
        : error.message || "Request failed.",
    ...(!isInternalError && error.details ? { details: error.details } : {})
  });
};
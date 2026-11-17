const { Pool } = require("pg");
const env = require("./env");
const logger = require("../utils/logger");

const pool = new Pool({
  connectionString: env.databaseUrl,
  max: env.dbPoolMax,
  connectionTimeoutMillis: env.dbConnectionTimeoutMs,
  idleTimeoutMillis: env.dbIdleTimeoutMs,
  query_timeout: env.dbQueryTimeoutMs,
  ssl: env.databaseSsl
    ? { rejectUnauthorized: env.databaseSslRejectUnauthorized }
    : false
});

pool.on("error", (error) => {
  logger.error("database_pool_error", {
    code: error.code || "unknown"
  });
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool
};
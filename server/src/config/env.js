require("dotenv").config();

const nodeEnv = process.env.NODE_ENV || "development";
const required = ["DATABASE_URL", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (nodeEnv === "production" && Buffer.byteLength(process.env.JWT_SECRET, "utf8") < 32) {
  throw new Error("JWT_SECRET must be at least 32 bytes in production.");
}

function readPositiveInteger(name, fallback, maximum) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isSafeInteger(value) || value <= 0 || value > maximum) {
    throw new Error(`${name} must be a positive integer no greater than ${maximum}.`);
  }
  return value;
}

const clientOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""));

for (const origin of clientOrigins) {
  let parsedOrigin;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    throw new Error("CLIENT_URL must contain one or more valid origins.");
  }
  if (!["http:", "https:"].includes(parsedOrigin.protocol) || parsedOrigin.origin !== origin) {
    throw new Error("CLIENT_URL entries must be HTTP or HTTPS origins without a path.");
  }
}

const trustProxy = process.env.TRUST_PROXY
  ? readPositiveInteger("TRUST_PROXY", 1, 10)
  : 0;

module.exports = {
  nodeEnv,
  port: readPositiveInteger("PORT", 5000, 65535),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  clientUrl: clientOrigins[0],
  clientOrigins,
  trustProxy,
  dbPoolMax: readPositiveInteger("DB_POOL_MAX", 10, 100),
  dbConnectionTimeoutMs: readPositiveInteger("DB_CONNECTION_TIMEOUT_MS", 5000, 120000),
  dbIdleTimeoutMs: readPositiveInteger("DB_IDLE_TIMEOUT_MS", 30000, 600000),
  dbQueryTimeoutMs: readPositiveInteger("DB_QUERY_TIMEOUT_MS", 30000, 600000),
  requestTimeoutMs: readPositiveInteger("REQUEST_TIMEOUT_MS", 60000, 600000),
  headersTimeoutMs: readPositiveInteger("HEADERS_TIMEOUT_MS", 65000, 600000),
  socketTimeoutMs: readPositiveInteger("SOCKET_TIMEOUT_MS", 120000, 600000),
  databaseSsl: process.env.DATABASE_SSL
    ? process.env.DATABASE_SSL === "true"
    : nodeEnv === "production",
  databaseSslRejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false"
};
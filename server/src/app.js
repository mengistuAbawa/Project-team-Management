const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const crypto = require("node:crypto");

const env = require("./config/env");
const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const app = express();

if (env.trustProxy) {
  app.set("trust proxy", env.trustProxy);
}

app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  const startedAt = process.hrtime.bigint();
  res.on("finish", () => {
    if (env.nodeEnv !== "test") {
      logger.info("http_request", {
        requestId: req.requestId,
        method: req.method,
        statusCode: res.statusCode,
        durationMs: Number(process.hrtime.bigint() - startedAt) / 1e6
      });
    }
  });
  next();
});

app.use(helmet());

app.use(cors({
  origin: env.clientOrigins,
  credentials: true
}));

const parseRegularJson = express.json({ limit: "2mb" });
const parsePublicJson = express.json({ limit: "16kb" });
app.use((req, res, next) => {
  const parser = req.originalUrl.startsWith("/api/v1/public/")
    ? parsePublicJson
    : parseRegularJson;
  parser(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.get("/", (req, res) => {
  res.json({
    name: "Project Team Management System API",
    version: "1.0.0",
    status: "running"
  });
});

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
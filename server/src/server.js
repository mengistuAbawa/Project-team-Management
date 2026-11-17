
const http = require("http");
const app = require("./app");
const db = require("./config/database");
const env = require("./config/env");
const { initializeSocket } = require("./config/socket");
const logger = require("./utils/logger");

async function startServer() {
  let server;

  try {
    // 1. Verify PostgreSQL connection
    await db.query("SELECT 1");
    logger.info("database_connected", {});

    // 2. Create HTTP server using Express
    server = http.createServer(app);
    server.requestTimeout = env.requestTimeoutMs;
    server.headersTimeout = Math.max(env.headersTimeoutMs, env.requestTimeoutMs + 1000);
    server.timeout = env.socketTimeoutMs;

    // 3. Initialize Socket.IO
    initializeSocket(server);

    // 4. Start HTTP server
    server.listen(env.port, () => {
      logger.info("server_started", {
        port: env.port,
        environment: env.nodeEnv,
        socketIo: true
      });
    });

    // 5. Graceful shutdown
    let isShuttingDown = false;

    const shutdown = async (signal) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info("server_shutdown_started", { signal });

      server.close(async (error) => {
        if (error) {
          logger.error("http_server_shutdown_failed", { code: error.code || "unknown" });
          process.exitCode = 1;
        }

        try {
          await db.pool.end();
          logger.info("database_pool_closed", {});
        } catch (dbError) {
          logger.error("database_shutdown_failed", { code: dbError.code || "unknown" });
          process.exitCode = 1;
        }

        logger.info("server_shutdown_complete", {});
        process.exit();
      });

      // Prevent indefinite shutdown if connections remain open.
      setTimeout(() => {
        logger.error("server_shutdown_timeout", {});
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (error) {
    logger.error("server_start_failed", {
      name: error.name,
      code: error.code || "unknown",
      message: error.message
    });

    if (server) {
      server.close();
    }

    try {
      await db.pool.end();
    } catch (dbError) {
      logger.error("database_cleanup_failed", { code: dbError.code || "unknown" });
    }

    process.exit(1);
  }
}

startServer();

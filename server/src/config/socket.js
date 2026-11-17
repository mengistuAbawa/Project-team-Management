
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const pool = require("./database");
const env = require("./env");
const logger = require("../utils/logger");

let io;

function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
      if (!decoded || typeof decoded !== "object" || typeof decoded.sub !== "string") {
        return next(new Error("Invalid or expired authentication token"));
      }

      const result = await pool.query(
        `SELECT
           u.id,
           u.full_name,
           u.is_active,
           r.name AS role
         FROM users u
         JOIN roles r ON r.id = u.role_id
         WHERE u.id = $1`,
        [decoded.sub]
      );

      if (!result.rowCount || !result.rows[0].is_active) {
        return next(new Error("User account is unavailable"));
      }

      socket.user = result.rows[0];
      next();
    } catch {
      logger.warn("auth.socket_failed", {});
      next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    // Each user gets a private room for notifications.
    socket.join(`user:${socket.user.id}`);

    socket.on("conversation:join", async (conversationId, callback) => {
      if (typeof conversationId !== "string" ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId)) {
        if (typeof callback === "function") {
          callback({ success: false, message: "Invalid conversation ID" });
        }
        return;
      }

      try {
        const result = await pool.query(
          `SELECT 1
           FROM conversation_members
           WHERE conversation_id = $1
             AND user_id = $2`,
          [conversationId, socket.user.id]
        );

        if (!result.rowCount) {
          if (typeof callback === "function") {
            callback({ success: false, message: "Access denied" });
          }
          return;
        }

        socket.join(`conversation:${conversationId}`);

        if (typeof callback === "function") {
          callback({ success: true });
        }
      } catch (error) {
        logger.error("socket_conversation_join_failed", {
          code: error.code || "unknown"
        });
        if (typeof callback === "function") {
          callback({ success: false, message: "Unable to join conversation" });
        }
      }
    });

    socket.on("conversation:leave", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("disconnect", () => {
      // Socket.IO automatically removes the socket from its rooms.
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
}

module.exports = {
  initializeSocket,
  getIO,
};

const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");
const jwt = require("jsonwebtoken");

process.env.NODE_ENV = "test";

const db = require("../src/config/database");
const env = require("../src/config/env");
const generateToken = require("../src/utils/generateToken");
const userId = "c1b74c70-5d81-46f6-8ec4-b1e9189d9b91";

class FakeServer {
  constructor(_server, options) {
    this.options = options;
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  on() {}
}

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === "socket.io") return { Server: FakeServer };
  return originalLoad.call(this, request, parent, isMain);
};
const { initializeSocket } = require("../src/config/socket");
Module._load = originalLoad;

test("Socket.IO authenticates with the subject claim used by HTTP JWTs", async () => {
  const originalQuery = db.query;
  const queries = [];
  db.query = async (text, values) => {
    queries.push({ text, values });
    return {
      rowCount: 1,
      rows: [{ id: userId, full_name: "QA User", is_active: true, role: "team_member" }]
    };
  };

  try {
    const io = initializeSocket({});
    const socket = {
      handshake: { auth: { token: generateToken({ id: userId, role: "team_member" }) } }
    };
    let authError;
    await io.middlewares[0](socket, (error) => { authError = error; });

    assert.equal(authError, undefined);
    assert.equal(socket.user.id, userId);
    assert.equal(queries[0].values[0], userId);
    assert.deepEqual(io.options.cors.origin, env.clientOrigins);
  } finally {
    db.query = originalQuery;
  }
});

test("Socket.IO rejects JWTs without a subject before querying the database", async () => {
  const originalQuery = db.query;
  db.query = async () => {
    throw new Error("Database must not be queried for a malformed subject.");
  };
  try {
    const io = initializeSocket({});
    const socket = {
      handshake: {
        auth: { token: jwt.sign({ id: userId }, env.jwtSecret, { algorithm: "HS256" }) }
      }
    };
    let authError;
    await io.middlewares[0](socket, (error) => { authError = error; });
    assert.equal(authError.message, "Invalid or expired authentication token");
  } finally {
    db.query = originalQuery;
  }
});

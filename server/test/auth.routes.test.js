const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

process.env.NODE_ENV = "test";

const db = require("../src/config/database");
const env = require("../src/config/env");
const userId = "c1b74c70-5d81-46f6-8ec4-b1e9189d9b91";
const password = "Correct-password-123";
const passwordHash = bcrypt.hashSync(password, 4);
const originalQuery = db.query;

db.query = async (text, values) => {
  if (text.includes("WHERE u.email = $1")) {
    return {
      rowCount: 1,
      rows: [{
        id: userId,
        full_name: "QA Member",
        email: values[0],
        password_hash: passwordHash,
        is_active: true,
        role: "team_member"
      }]
    };
  }
  if (text === "SELECT 1") {
    return { rowCount: 1, rows: [{ "?column?": 1 }] };
  }
  if (text.includes("WHERE u.id = $1")) {
    return {
      rowCount: 1,
      rows: [{
        id: userId,
        full_name: "QA Member",
        email: "qa@example.invalid",
        phone: null,
        avatar_url: null,
        is_active: true,
        role: "team_member"
      }]
    };
  }
  throw new Error("Unexpected database query in auth route test.");
};

const app = require("../src/app");
let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;
});

test("health readiness returns a safe 503 when PostgreSQL is unavailable", async () => {
  const originalQuery = db.query;
  db.query = async () => {
    throw Object.assign(new Error("database credentials must not be returned"), { code: "ECONNREFUSED" });
  };
  try {
    const response = await fetch(`${baseUrl}/health/ready`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { success: false, status: "not_ready" });
  } finally {
    db.query = originalQuery;
  }
});

test.after(async () => {
  db.query = originalQuery;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await db.pool.end();
});

test("valid login returns a JWT that can load the current user", async () => {
  const login = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "qa@example.invalid", password })
  });
  const loginBody = await login.json();

  assert.equal(login.status, 200);
  assert.equal(loginBody.data.user.role, "team_member");
  assert.ok(loginBody.data.token);
  assert.equal(Object.prototype.hasOwnProperty.call(loginBody.data.user, "password_hash"), false);

  const currentUser = await fetch(`${baseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${loginBody.data.token}` }
  });

  test("health readiness verifies the database without exposing internals", async () => {
    const response = await fetch(`${baseUrl}/health/ready`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, status: "ready" });
  });
  const currentUserBody = await currentUser.json();
  assert.equal(currentUser.status, 200);
  assert.equal(currentUserBody.data.user.id, userId);
});

test("invalid login input and incorrect passwords are rejected", async () => {
  const invalidEmail = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "invalid", password })
  });
  const originalWarn = console.warn;
  const logs = [];
  console.warn = (record) => logs.push(JSON.parse(record));
  let wrongPassword;
  try {
    wrongPassword = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "qa@example.invalid", password: "wrong-password" })
    });
  } finally {
    console.warn = originalWarn;
  }

  assert.equal(invalidEmail.status, 400);
  assert.equal(wrongPassword.status, 401);
  assert.equal((await wrongPassword.json()).message, "Invalid email or password.");
  assert.equal(logs[0].event, "auth.login_failed");
  assert.ok(logs[0].requestId);
  assert.equal(JSON.stringify(logs).includes("qa@example.invalid"), false);
  assert.equal(JSON.stringify(logs).includes("wrong-password"), false);
});

test("missing and expired JWTs are rejected before user lookup", async () => {
  const missing = await fetch(`${baseUrl}/auth/me`);
  const expiredToken = jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: "-1s" });
  const expired = await fetch(`${baseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${expiredToken}` }
  });

  assert.equal(missing.status, 401);
  assert.equal(expired.status, 401);
});

test("open registration remains disabled", async () => {
  const response = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName: "QA User", email: "qa@example.invalid", password })
  });

  assert.equal(response.status, 410);
});

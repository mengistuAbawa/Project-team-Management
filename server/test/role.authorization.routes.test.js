const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.NODE_ENV = "test";

const db = require("../src/config/database");
const env = require("../src/config/env");
const userId = "c1b74c70-5d81-46f6-8ec4-b1e9189d9b91";
const roles = [
  "system_admin",
  "project_manager",
  "team_leader",
  "team_member",
  "client",
  "qa_reviewer"
];
let currentRole = "system_admin";
const originalQuery = db.query;

db.query = async (text) => {
  if (text.includes("WHERE u.id = $1")) {
    return {
      rowCount: 1,
      rows: [{ id: userId, full_name: "QA User", email: "qa@example.invalid", is_active: true, role: currentRole }]
    };
  }
  if (text.includes("COUNT(*)::int AS total")) {
    return { rowCount: 1, rows: [{ total: 0 }] };
  }
  if (text.includes("ORDER BY u.created_at DESC")) {
    return { rowCount: 1, rows: [] };
  }
  throw new Error("Unexpected database query in role authorization test.");
};

const app = require("../src/app");
let server;
let baseUrl;
const token = jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: "1h" });

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;
});

test.after(async () => {
  db.query = originalQuery;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await db.pool.end();
});

test("user-management API permits only the system administrator role", async () => {
  for (const role of roles) {
    currentRole = role;
    const response = await fetch(`${baseUrl}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    assert.equal(response.status, role === "system_admin" ? 200 : 403, role);
  }
});

test("protected user-management API rejects a missing JWT", async () => {
  const response = await fetch(`${baseUrl}/users`);
  assert.equal(response.status, 401);
});

const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const db = require("../src/config/database");
const env = require("../src/config/env");

process.env.NODE_ENV = "test";

const userId = "c1b74c70-5d81-46f6-8ec4-b1e9189d9b91";
const token = jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: "1h" });
const originalQuery = db.query;
let queryCount = 0;
db.query = async () => {
  queryCount += 1;
  return {
    rowCount: 1,
    rows: [{ id: userId, full_name: "QA Admin", email: "qa@example.invalid", is_active: true, role: "system_admin" }]
  };
};

const app = require("../src/app");
let server;
let baseUrl;

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

test("user detail and activation endpoints reject malformed IDs before service queries", async () => {
  const requests = [
    ["GET", "/users/not-a-uuid"],
    ["PATCH", "/users/not-a-uuid/activate"],
    ["PATCH", "/users/not-a-uuid/deactivate"]
  ];

  for (const [method, path] of requests) {
    queryCount = 0;
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}` }
    });
    const body = await response.json();

    assert.equal(response.status, 400, `${method} ${path}`);
    assert.equal(body.message, "Validation failed.");
    assert.equal(queryCount, 1, "only authentication should query the database");
  }
});

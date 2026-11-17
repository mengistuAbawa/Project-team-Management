const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;
});

test.after(async () => {
  if (server) await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("public contact endpoint validates requests before database access", async () => {
  const response = await fetch(`${baseUrl}/public/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.message, "Validation failed.");
  assert.ok(body.errors.some((error) => error.field === "email"));
});

test("administrator request endpoints require authentication", async () => {
  const response = await fetch(`${baseUrl}/admin/public-requests/access-requests`);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.message, "Authentication token is required.");
});

test("public API enforces the small JSON body limit", async () => {
  const response = await fetch(`${baseUrl}/public/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "x".repeat(17_000) })
  });
  const body = await response.json();

  assert.equal(response.status, 413);
  assert.equal(body.message, "Request body exceeds the allowed size.");
});

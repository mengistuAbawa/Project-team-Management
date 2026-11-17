const test = require("node:test");
const assert = require("node:assert/strict");
const errorHandler = require("../src/middleware/errorHandler");

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

test("internal errors do not expose database details or stacks in API responses", () => {
  const originalError = console.error;
  console.error = () => {};
  try {
    const response = createResponse();
    const error = Object.assign(new Error("database password or SQL details"), {
      statusCode: 500,
      details: { query: "private query" }
    });
    errorHandler(error, {}, response, () => {});

    assert.equal(response.statusCode, 500);
    assert.deepEqual(response.body, {
      success: false,
      message: "Internal server error."
    });
  } finally {
    console.error = originalError;
  }
});

test("production logs internal error context without logging the message or returning details", () => {
  const originalError = console.error;
  const env = require("../src/config/env");
  const originalNodeEnv = env.nodeEnv;
  const logged = [];
  env.nodeEnv = "production";
  console.error = (record) => logged.push(JSON.parse(record));
  try {
    const response = createResponse();
    const error = Object.assign(new Error("private email value or SQL details"), {
      code: "42703",
      column: "email_verified"
    });
    errorHandler(error, {}, response, () => {});

    assert.equal(response.statusCode, 500);
    assert.deepEqual(response.body, {
      success: false,
      message: "Internal server error."
    });
    assert.equal(logged[0].event, "internal_api_error");
    assert.equal(logged[0].code, "42703");
    assert.equal(logged[0].column, "email_verified");
    assert.ok(logged[0].stack.includes("errorHandler.test.js"));
    assert.ok(!JSON.stringify(logged).includes("private email value or SQL details"));
  } finally {
    env.nodeEnv = originalNodeEnv;
    console.error = originalError;
  }
});

test("oversized JSON requests return a safe client error", () => {
  const originalError = console.error;
  console.error = () => {};
  try {
    const response = createResponse();
    errorHandler(Object.assign(new Error("raw parser detail"), {
      status: 413,
      type: "entity.too.large"
    }), {}, response, () => {});

    assert.equal(response.statusCode, 413);
    assert.equal(response.body.message, "Request body exceeds the allowed size.");
  } finally {
    console.error = originalError;
  }
});

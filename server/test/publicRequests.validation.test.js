const test = require("node:test");
const assert = require("node:assert/strict");
const { validationResult } = require("express-validator");
const validation = require("../src/modules/public-requests/publicRequests.validation");

async function validate(chains, body, params = {}, query = {}) {
  const req = { body, params, query };
  await Promise.all(chains.map((chain) => chain.run(req)));
  return validationResult(req).array();
}

test("contact submission accepts the public contact fields and normalizes email", async () => {
  const body = {
    fullName: "  Alex Example  ",
    email: "ALEX@example.com",
    organization: " Example Org ",
    subject: "information",
    message: "  Please send me more information.  "
  };
  const errors = await validate(validation.publicContactValidation, body);
  assert.deepEqual(errors, []);
  assert.equal(body.fullName, "Alex Example");
  assert.equal(body.email, "alex@example.com");
  assert.equal(body.message, "Please send me more information.");
});

test("public access requests cannot specify their own role", async () => {
  const errors = await validate(validation.publicAccessRequestValidation, {
    fullName: "Alex Example",
    email: "alex@example.com",
    organization: "Example Org",
    jobTitle: "Project coordinator",
    phone: "",
    reason: "I would like to coordinate my organization projects.",
    role: "system_admin"
  });
  assert.ok(errors.some((error) => error.path === "role"));
});

test("access request approval requires a non-administrator role", async () => {
  const base = { id: "c1b74c70-5d81-46f6-8ec4-b1e9189d9b91" };
  const valid = await validate(validation.accessDecisionValidation, {
    decision: "approved",
    role: "project_manager"
  }, base);
  const adminRole = await validate(validation.accessDecisionValidation, {
    decision: "approved",
    role: "system_admin"
  }, base);
  const rejectedWithRole = await validate(validation.accessDecisionValidation, {
    decision: "rejected",
    role: "team_member"
  }, base);
  assert.deepEqual(valid, []);
  assert.ok(adminRole.some((error) => error.path === "role"));
  assert.ok(rejectedWithRole.some((error) => error.path === "role"));
});

test("access request validation rejects invalid email and excessive text", async () => {
  const errors = await validate(validation.publicAccessRequestValidation, {
    fullName: "A",
    email: "not-an-email",
    organization: "x",
    jobTitle: "x",
    phone: "x".repeat(31),
    reason: "short"
  });
  assert.ok(errors.some((error) => error.path === "email"));
  assert.ok(errors.some((error) => error.path === "phone"));
  assert.ok(errors.some((error) => error.path === "reason"));
});

const test = require("node:test");
const assert = require("node:assert/strict");
const { validationResult } = require("express-validator");
const validation = require("../src/modules/users/users.validation");

async function validate(chains, body, params = {}) {
  const req = { body, params };
  await Promise.all(chains.map((chain) => chain.run(req)));
  return validationResult(req).array();
}

test("user updates accept and normalize valid email addresses", async () => {
  const body = { email: "  ADMIN@GMAIL.COM " };
  const errors = await validate(
    validation.updateUserValidation,
    body,
    { id: "c1b74c70-5d81-46f6-8ec4-b1e9189d9b91" }
  );

  assert.deepEqual(errors, []);
  assert.equal(body.email, "admin@gmail.com");
});

test("user updates reject invalid email addresses", async () => {
  const errors = await validate(
    validation.updateUserValidation,
    { email: "not-an-email" },
    { id: "c1b74c70-5d81-46f6-8ec4-b1e9189d9b91" }
  );

  assert.ok(errors.some((error) => error.path === "email"));
});

test("invitation validation accepts role-specific profile data for all six roles", async () => {
  const examples = [
    ["system_admin", { administratorLevel: "global", administrativePermissions: [], managedOrganizationIds: [] }],
    ["project_manager", { approvalScope: "Project" }],
    ["team_leader", { leadershipResponsibilities: "Delivery" }],
    ["team_member", { skills: ["planning"], experienceLevel: "intermediate" }],
    ["client", { companyName: "Example Corp" }],
    ["qa_reviewer", { testingExpertise: ["integration"], reviewResponsibilities: "Review releases" }]
  ];

  for (const [role, roleAttributes] of examples) {
    const errors = await validate(validation.createUserValidation, {
      fullName: "QA Example",
      email: "qa@example.com",
      role,
      roleAttributes,
      ...(role === "system_admin" ? { confirmSystemAdmin: true } : {})
    });
    assert.deepEqual(errors, [], role);
  }
});

test("invitation validation requires explicit confirmation for global administrators", async () => {
  const errors = await validate(validation.createUserValidation, {
    fullName: "QA Example",
    email: "qa@example.com",
    role: "system_admin",
    roleAttributes: {}
  });

  assert.ok(errors.some((error) => error.msg.includes("Confirm global administrator privileges")));
});

test("invitation validation rejects fields for a different role", async () => {
  const errors = await validate(validation.createUserValidation, {
    fullName: "QA Example",
    email: "qa@example.com",
    role: "client",
    roleAttributes: { skills: ["planning"] }
  });

  assert.ok(errors.some((error) => error.msg.includes("do not match the selected role")));
});

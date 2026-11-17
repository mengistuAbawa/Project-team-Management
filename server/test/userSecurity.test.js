const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createInvitationToken,
  hashInvitationToken,
  assertAdminRemovalAllowed,
  assertInvitationMembershipScope,
  assertAccessRequestRole
} = require("../src/modules/users/userSecurity");
const authorize = require("../src/middleware/authorize");

test("invitation token is random and persisted as a one-way digest", () => {
  const first = createInvitationToken();
  const second = createInvitationToken();

  assert.equal(first.token.length, 43);
  assert.match(first.tokenHash, /^[a-f0-9]{64}$/);
  assert.equal(hashInvitationToken(first.token), first.tokenHash);
  assert.notEqual(first.tokenHash, first.token);
  assert.notEqual(first.token, second.token);
  assert.notEqual(first.tokenHash, second.tokenHash);
});

test("last active system administrator cannot be demoted or deactivated", () => {
  assert.throws(
    () => assertAdminRemovalAllowed({
      role: "system_admin",
      isActive: true,
      nextRole: "team_member",
      activeAdminCount: 1
    }),
    /last active system administrator/
  );
  assert.throws(
    () => assertAdminRemovalAllowed({
      role: "system_admin",
      isActive: true,
      nextIsActive: false,
      activeAdminCount: 1
    }),
    /last active system administrator/
  );
});

test("admin removal is allowed when another active administrator remains", () => {
  assert.doesNotThrow(() => assertAdminRemovalAllowed({
    role: "system_admin",
    isActive: true,
    nextRole: "team_member",
    activeAdminCount: 2
  }));
});

test("guard does not block unrelated changes", () => {
  assert.doesNotThrow(() => assertAdminRemovalAllowed({
    role: "team_member",
    isActive: true,
    nextRole: "client",
    activeAdminCount: 0
  }));
});

test("global management authorization accepts only authenticated system administrators", () => {
  function run(user) {
    let passed = false;
    let error = null;
    authorize("system_admin")(
      { user },
      {},
      (nextError) => {
        if (nextError) error = nextError;
        else passed = true;
      }
    );
    return { passed, error };
  }

  assert.equal(run({ id: "1", role: "system_admin" }).passed, true);
  assert.equal(run({ id: "2", role: "project_manager" }).error.statusCode, 403);
  assert.equal(run(null).error.statusCode, 401);
});

test("invitation membership scope rejects admin memberships and orphan teams", () => {
  assert.throws(
    () => assertInvitationMembershipScope({
      role: "system_admin",
      projectId: "project-id"
    }),
    /System administrators cannot be assigned/
  );
  assert.throws(
    () => assertInvitationMembershipScope({
      role: "team_member",
      teamId: "team-id"
    }),
    /requires its project ID/
  );
  assert.doesNotThrow(() => assertInvitationMembershipScope({
    role: "team_member",
    projectId: "project-id",
    teamId: "team-id"
  }));
});

test("access request approval accepts standard roles but never system administrator", () => {
  for (const role of ["project_manager", "team_leader", "team_member", "client", "qa_reviewer"]) {
    assert.doesNotThrow(() => assertAccessRequestRole(role));
  }
  assert.throws(() => assertAccessRequestRole("system_admin"), /cannot be approved/);
  assert.throws(() => assertAccessRequestRole("unknown_role"), /cannot be approved/);
});

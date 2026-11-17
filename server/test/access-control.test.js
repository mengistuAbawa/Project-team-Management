const test = require("node:test");
const assert = require("node:assert/strict");
const db = require("../src/config/database");
const { requireProjectAccess } = require("../src/middleware/projectAccess");
const { requireTeamAccess } = require("../src/middleware/teamAccess");
const { requireQaAssignee } = require("../src/middleware/taskAccess");

const userId = "c1b74c70-5d81-46f6-8ec4-b1e9189d9b91";
const projectId = "3a3b5953-3470-4e15-9019-93436c17677a";
const teamId = "dbe44df6-0d3d-42b9-b6e8-e9872dc007af";
const originalQuery = db.query;

function runMiddleware(middleware, req) {
  return new Promise((resolve) => {
    middleware(req, {}, (error) => resolve(error || null));
  });
}

test.after(() => {
  db.query = originalQuery;
  return db.pool.end();
});

test("project access allows admins, assigned managers, and assigned members only", async () => {
  db.query = async (_query, [requestedProjectId, requestedUserId]) => ({
    rowCount: 1,
    rows: [{
      id: requestedProjectId,
      manager_id: userId,
      is_member: requestedUserId === userId
    }]
  });

  const adminReq = { params: { id: projectId }, user: { id: "admin-id", role: "system_admin" } };
  const managerReq = { params: { id: projectId }, user: { id: userId, role: "project_manager" } };
  const memberReq = { params: { id: projectId }, user: { id: userId, role: "client" } };
  const outsiderReq = { params: { id: projectId }, user: { id: "outsider-id", role: "team_member" } };

  assert.equal(await runMiddleware(requireProjectAccess, adminReq), null);
  assert.equal(await runMiddleware(requireProjectAccess, managerReq), null);
  assert.equal(await runMiddleware(requireProjectAccess, memberReq), null);
  assert.equal((await runMiddleware(requireProjectAccess, outsiderReq)).statusCode, 403);
});

test("team access is limited to admins, assigned managers, leaders, and members", async () => {
  db.query = async (_query, [requestedTeamId, requestedUserId]) => ({
    rowCount: 1,
    rows: [{
      id: requestedTeamId,
      project_id: projectId,
      leader_id: userId,
      manager_id: userId,
      is_project_manager: false,
      is_member: requestedUserId === userId
    }]
  });

  const leaderReq = { params: { teamId }, user: { id: userId, role: "team_leader" } };
  const memberReq = { params: { teamId }, user: { id: userId, role: "team_member" } };
  const outsiderReq = { params: { teamId }, user: { id: "outsider-id", role: "client" } };

  assert.equal(await runMiddleware(requireTeamAccess, leaderReq), null);
  assert.equal(await runMiddleware(requireTeamAccess, memberReq), null);
  assert.equal((await runMiddleware(requireTeamAccess, outsiderReq)).statusCode, 403);
});

test("project managers retain access when assigned through project membership instead of the project manager field", async () => {
  db.query = async (_query, [requestedProjectId, requestedUserId]) => ({
    rowCount: 1,
    rows: [{
      id: requestedProjectId,
      manager_id: "other-manager-id",
      is_project_manager: true,
      is_member: false
    }]
  });

  const assignedManagerReq = {
    params: { id: projectId },
    user: { id: userId, role: "project_manager" }
  };

  assert.equal(await runMiddleware(requireProjectAccess, assignedManagerReq), null);
});

test("only an assigned QA reviewer can submit a task review", () => {
  let error;
  requireQaAssignee(
    { user: { role: "qa_reviewer" }, task: { is_assignee: true } },
    {},
    (nextError) => { error = nextError; }
  );
  assert.equal(error, undefined);

  requireQaAssignee(
    { user: { role: "qa_reviewer" }, task: { is_assignee: false } },
    {},
    (nextError) => { error = nextError; }
  );
  assert.equal(error.statusCode, 403);
});

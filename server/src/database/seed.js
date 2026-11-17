
const db = require("../config/database");

const roles = [
  ["system_admin", "System Administrator"],
  ["project_manager", "Project Manager"],
  ["team_leader", "Team Leader"],
  ["team_member", "Team Member"],
  ["client", "Client / Stakeholder"],
  ["qa_reviewer", "QA / Reviewer"]
];

async function seed() {
  try {
    for (const [name, description] of roles) {
      await db.query(
        `INSERT INTO roles (name, description)
         VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [name, description]
      );
    }

    console.log("PTMS roles seeded successfully.");
  } catch (error) {
    console.error("Role seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

seed();

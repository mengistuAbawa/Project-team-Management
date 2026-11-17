require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("../config/database");

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env first."
    );
  }

  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("The initial administrator password must be at least 12 characters.");
  }

  const roleResult = await db.query(
    "SELECT id FROM roles WHERE name = $1",
    ["system_admin"]
  );

  if (!roleResult.rows.length) {
    throw new Error("Roles are missing. Run npm run db:seed first.");
  }

  const existing = await db.query(
    "SELECT id FROM users WHERE email = $1",
    [ADMIN_EMAIL.toLowerCase()]
  );

  if (existing.rows.length) {
    console.log("An account with this email already exists. No administrator was created.");
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const result = await db.query(
    `INSERT INTO users (full_name, email, password_hash, role_id, email_verified)
     VALUES ($1, $2, $3, $4, TRUE)
     RETURNING id, full_name, email`,
    [
      ADMIN_NAME,
      ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      roleResult.rows[0].id
    ]
  );

  console.log("Initial system administrator created:");
  console.log(result.rows[0]);
}

createAdmin()
  .catch((error) => {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.pool.end();
  });
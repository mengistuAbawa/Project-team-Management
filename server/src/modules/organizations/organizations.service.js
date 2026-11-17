const db = require("../../config/database");
const ApiError = require("../../utils/ApiError");

async function list() {
  const result = await db.query(
    `SELECT o.id, o.name, o.description, o.created_at,
            COUNT(d.id)::int AS department_count
     FROM organizations o
     LEFT JOIN departments d ON d.organization_id = o.id
     GROUP BY o.id
     ORDER BY o.created_at DESC`
  );

  return result.rows;
}

async function getById(id) {
  const result = await db.query(
    `SELECT id, name, description, created_at
     FROM organizations
     WHERE id = $1`,
    [id]
  );

  if (!result.rows.length) {
    throw new ApiError(404, "Organization not found.");
  }

  return result.rows[0];
}

async function create({ name, description }) {
  const result = await db.query(
    `INSERT INTO organizations (name, description)
     VALUES ($1, $2)
     RETURNING id, name, description, created_at`,
    [name, description || null]
  );

  return result.rows[0];
}

async function update(id, data) {
  const current = await getById(id);

  const result = await db.query(
    `UPDATE organizations
     SET name = $1, description = $2
     WHERE id = $3
     RETURNING id, name, description`,
    [
      data.name ?? current.name,
      data.description === undefined
        ? current.description
        : data.description,
      id
    ]
  );

  return result.rows[0];
}

async function remove(id) {
  await getById(id);

  // Departments are configured with ON DELETE CASCADE.
  // Projects referencing the organization use ON DELETE SET NULL.
  await db.query(
    "DELETE FROM organizations WHERE id = $1",
    [id]
  );

  return { id };
}

module.exports = { list, getById, create, update, remove };
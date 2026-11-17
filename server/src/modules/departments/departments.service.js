const db = require("../../config/database");
const ApiError = require("../../utils/ApiError");

async function list(organizationId) {
  const values = [];
  let filter = "";

  if (organizationId) {
    values.push(organizationId);
    filter = "WHERE d.organization_id = $1";
  }

  const result = await db.query(
    `SELECT d.id, d.name, d.organization_id,
            d.created_at, o.name AS organization_name
     FROM departments d
     JOIN organizations o ON o.id = d.organization_id
     ${filter}
     ORDER BY o.name, d.name`,
    values
  );

  return result.rows;
}

async function getById(id) {
  const result = await db.query(
    `SELECT d.id, d.name, d.organization_id,
            d.created_at, o.name AS organization_name
     FROM departments d
     JOIN organizations o ON o.id = d.organization_id
     WHERE d.id = $1`,
    [id]
  );

  if (!result.rows.length) {
    throw new ApiError(404, "Department not found.");
  }

  return result.rows[0];
}

async function create({ organizationId, name }) {
  const organization = await db.query(
    "SELECT id FROM organizations WHERE id = $1",
    [organizationId]
  );

  if (!organization.rows.length) {
    throw new ApiError(404, "Organization not found.");
  }

  try {
    const result = await db.query(
      `INSERT INTO departments (organization_id, name)
       VALUES ($1, $2)
       RETURNING id, organization_id, name, created_at`,
      [organizationId, name]
    );

    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      throw new ApiError(
        409,
        "This department already exists in the organization."
      );
    }

    throw error;
  }
}

async function update(id, data) {
  const current = await getById(id);

  const organizationId =
    data.organizationId ?? current.organization_id;

  const name = data.name ?? current.name;

  const organization = await db.query(
    "SELECT id FROM organizations WHERE id = $1",
    [organizationId]
  );

  if (!organization.rows.length) {
    throw new ApiError(404, "Organization not found.");
  }

  try {
    const result = await db.query(
      `UPDATE departments
       SET organization_id = $1, name = $2
       WHERE id = $3
       RETURNING id, organization_id, name, created_at`,
      [organizationId, name, id]
    );

    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      throw new ApiError(
        409,
        "This department already exists in the organization."
      );
    }

    throw error;
  }
}

async function remove(id) {
  await getById(id);

  await db.query(
    "DELETE FROM departments WHERE id = $1",
    [id]
  );

  return { id };
}

module.exports = { list, getById, create, update, remove };
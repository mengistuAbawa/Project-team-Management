const db = require("../../config/database");

exports.list = async (req, res) => {
  const result = await db.query(
    `SELECT id, name, description, created_at
     FROM roles
     ORDER BY id ASC`
  );

  res.json({
    success: true,
    data: result.rows
  });
};
const db = require("../db");

// GET all reports
exports.getAllReports = (req, res) => {
  const query = `
    SELECT
      id AS referenceCode, -- Assuming 'id' is the correct column name
      user_id AS filedBy, -- Updated to use 'user_id' instead of 'filed_by'
      concern,
      description,
      status,
      current_approval_stage,
      is_fully_approved,
      date_reported,
      date_updated,
      created_at
    FROM requests
    ORDER BY date_reported DESC
  `;

  console.log("[DEBUG] Executing query to fetch all reports:", query); // Debug log

  db.query(query, (err, results) => {
    if (err) {
      console.error("[DEBUG] Error fetching reports:", err); // Debug log
      return res.status(500).json({ message: "DB error", error: err });
    }

    console.log("[DEBUG] Query results:", results); // Debug log
    res.json(results);
  });
};
const db = require("../db");

exports.getReports = (req, res) => {
  const query = `
    SELECT
      id AS referenceCode, -- Assuming 'id' is the correct column name
      filed_by AS filedBy,
      concern,
      description,
      status,
      current_approval_stage,
      is_fully_approved,
      date_reported,
      date_updated,
      created_at,
      ppgs_reject_reason,
      president_reject_reason
    FROM requests
    ORDER BY date_reported DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("DB query error:", err); // <-- log full error
      return res.status(500).json({ message: "DB error", error: err });
    }
    res.json(results);
  });
};

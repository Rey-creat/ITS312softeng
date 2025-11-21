const db = require("../db");

// GET all completed requests for PPLS Head
exports.getCompletedRequests = (req, res) => {
  const query = `
    SELECT id, user_id, date_filed, date_needed, type_of_concern, description, requested_by, status
    FROM requests
    WHERE status = 'Completed'
    ORDER BY date_filed ASC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json(results);
  });
};

// UPDATE request status to 'Archived'
exports.archiveRequest = (req, res) => {
  const { id } = req.params;
  const query = `UPDATE requests SET status = 'Archived' WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request archived successfully" });
  });
};
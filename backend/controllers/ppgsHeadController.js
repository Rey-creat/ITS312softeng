const db = require("../db");

// GET all approved requests for PPGS Head
exports.getApprovedRequests = (req, res) => {
  const query = `
    SELECT id, user_id, date_filed, date_needed, type_of_concern, description, requested_by, status
    FROM requests
    WHERE status = 'Approved'
    ORDER BY date_filed ASC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json(results);
  });
};

// UPDATE request status to 'In Progress'
exports.markInProgress = (req, res) => {
  const { id } = req.params;
  const query = `UPDATE requests SET status = 'In Progress' WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request marked as In Progress" });
  });
};

// UPDATE request status to 'Completed'
exports.markCompleted = (req, res) => {
  const { id } = req.params;
  const query = `UPDATE requests SET status = 'Completed' WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request marked as Completed" });
  });
};
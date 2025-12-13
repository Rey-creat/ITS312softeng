const db = require("../db");

// GET all requests for PPGS Head: show requests that are Noted and need PPGS action, or already processed
exports.getApprovedRequests = (req, res) => {
  const query = `
    SELECT id, user_id, date_filed, date_needed, type_of_concern, description, requested_by, ppgshead, noted_by, urgency
    FROM requests
    WHERE (noted_by IS NOT NULL AND noted_by != 'Pending' AND (ppgshead IS NULL OR ppgshead = 'Pending'))
      OR ppgshead = 'Approved'
      OR ppgshead = 'Rejected'
    ORDER BY date_filed ASC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json(results);
  });
};

// APPROVE a request
exports.approveRequest = (req, res) => {
  const { id } = req.params;
  const query = `UPDATE requests SET ppgshead = 'Approved' WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request approved successfully" });
  });
};

// REJECT a request
exports.rejectRequest = (req, res) => {
  const { id } = req.params;
  const query = `UPDATE requests SET ppgshead = 'Rejected' WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request rejected successfully" });
  });
};

// UPDATE request status to 'In Progress'
exports.markInProgress = (req, res) => {
  const { id } = req.params;
  const query = `UPDATE requests SET ppgshead = 'In Progress' WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request marked as In Progress" });
  });
};

// UPDATE request status to 'Completed'
exports.markCompleted = (req, res) => {
  const { id } = req.params;
  const query = `UPDATE requests SET ppgshead = 'Completed' WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request marked as Completed" });
  });
};
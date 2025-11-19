const db = require("../db");

// GET all requests for Dept Head
exports.getAllRequests = (req, res) => {
  console.log("[DEBUG] getAllRequests endpoint hit"); // Debug log
  const query = `
    SELECT id, user_id, date_filed, date_needed, type_of_concern, description, requested_by, status
    FROM requests
    ORDER BY date_filed ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("[DEBUG] DB error:", err); // Debug log
      return res.status(500).json({ message: "DB error", error: err });
    }
    console.log("[DEBUG] Query results:", results); // Debug log
    res.json(results);
  });
};

// GET all pending requests for Dept Head
exports.getPendingRequests = (req, res) => {
  const query = `
    SELECT id, user_id, date_filed, date_needed, type_of_concern, description, requested_by, status
    FROM requests
    WHERE status = 'Pending'
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
  const query = `UPDATE requests SET status = 'Approved' WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request approved successfully" });
  });
};

// REJECT a request
exports.rejectRequest = (req, res) => {
  const { id } = req.params;
  const query = `UPDATE requests SET status = 'Rejected' WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request rejected successfully" });
  });
};

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

const db = require("../db");

// GET all requests for Dept Head
exports.getAllRequests = (req, res) => {
  console.log("[DEBUG] getAllRequests endpoint hit"); // Debug log
  const query = `
    SELECT r.id, r.user_id, r.date_filed, r.date_needed, r.type_of_concern, r.description, r.requested_by, r.urgency, r.ppgshead, r.noted_by, r.department
    FROM requests r
    ORDER BY r.date_filed ASC
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

// ADD 'Noted By' to a request
exports.addNotedBy = (req, res) => {
  const { id } = req.params;
  const { noted_by } = req.body;

  console.log(`[DEBUG] addNotedBy called with ID: ${id}, Noted By: ${noted_by}`);

  if (!noted_by || !noted_by.trim()) {
    console.log("[DEBUG] 'Noted By' field is missing");
    return res.status(400).json({ message: "'Noted By' field is required" });
  }

  const query = `UPDATE requests SET noted_by = ? WHERE id = ?`;
  db.query(query, [noted_by, id], (err, result) => {
    if (err) {
      console.error("[DEBUG] DB error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }
    if (result.affectedRows === 0) {
      console.log("[DEBUG] Request not found");
      return res.status(404).json({ message: "Request not found" });
    }
    console.log("[DEBUG] Request noted successfully");
    res.json({ message: "Request noted successfully" });
  });
};

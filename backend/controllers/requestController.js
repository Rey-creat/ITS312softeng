// Filtered: Only requests approved by President (using status field only)
exports.listPresidentApprovedRequests = (req, res) => {
  db.query("SELECT id, status, requested_by, description FROM requests WHERE status = 'Approved'", (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.status(200).json(results);
  });
};
// TEMPORARY: List all requests for debugging
exports.listAllRequests = (req, res) => {
  db.query("SELECT id, status, requested_by, description FROM requests", (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.status(200).json(results);
  });
};
// ASSIGN PERSONNEL TO REQUEST
exports.assignPersonnel = (req, res) => {
  const { id } = req.params;
  const { personnelName } = req.body;
  if (!personnelName || typeof personnelName !== 'string' || !personnelName.trim()) {
    return res.status(400).json({ message: "Personnel name required" });
  }
  db.query(
    "UPDATE requests SET assigned_to = ?, assigned_personnel_name = ? WHERE id = ?",
    [personnelName.trim(), personnelName.trim(), id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
      res.status(200).json({ message: "Personnel assigned successfully" });
    }
  );
};
// PRESIDENT DECISION ENDPOINT
exports.setPresidentDecision = (req, res) => {
  const { id } = req.params;
  const { status, president_by } = req.body;
  if (!status) {
    return res.status(400).json({ message: "President decision required" });
  }
  db.query(
    "UPDATE requests SET status = ? WHERE id = ?",
    [status, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
      db.query("SELECT * FROM requests WHERE id = ?", [id], (err2, rows) => {
        if (err2) return res.status(500).json({ message: "DB error", error: err2 });
        res.status(200).json({ message: "President decision updated", request: rows[0] });
      });
    }
  );
};
const db = require("../db");

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return "";
  if (typeof date === "string") return date;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

// FETCH ALL REQUESTS
exports.getRequests = (req, res) => {
  const userId = req.query.user_id;
  const role = req.query.role;
  const assignedTo = req.query.assigned_to;
  const hasAssigned = req.query.has_assigned;

  let query = `SELECT * FROM requests`;
  let where = [];
  let values = [];

  if (role !== "Admin" && userId) {
    where.push("r.user_id = ?");
    values.push(userId);
  }
  if (assignedTo) {
    where.push("assigned_to = ?");
    values.push(assignedTo);
  }
  if (hasAssigned) {
    where.push("assigned_to IS NOT NULL AND assigned_to != ''");
  }
  if (where.length > 0) {
    query += " WHERE " + where.join(" AND ");
  }
    query += " ORDER BY date_filed DESC";

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("DB error in getRequests:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    const formatted = results.map(r => ({
      ...r,
      date_filed: formatDate(r.date_filed),
      date_needed: formatDate(r.date_needed),
      assigned_personnel_name: r.assigned_personnel_name || null,
    }));

    res.status(200).json(formatted);
  });
};

// CREATE REQUEST
exports.createRequest = (req, res) => {
  const { user_id, date_filed, date_needed, type_of_concern, description, requested_by } = req.body;
  if (!user_id || !date_filed || !date_needed || !type_of_concern || !description || !requested_by) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Always set status, noted_by, and ppgshead to 'Pending' for new requests
  const status = 'Pending';
  const noted_by = 'Pending';
  const ppgshead = 'Pending';

  db.query(
    "INSERT INTO requests (user_id, date_filed, date_needed, type_of_concern, description, requested_by, status, noted_by, ppgshead) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [user_id, date_filed, date_needed, type_of_concern, description, requested_by, status, noted_by, ppgshead],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.status(201).json({ message: "Request created successfully", requestId: result.insertId });
    }
  );
};

// UPDATE REQUEST
exports.updateRequest = (req, res) => {
  const { id } = req.params;
  const { date_needed, type_of_concern, description, status, done_by } = req.body;

  // Debug log incoming body
  console.log('updateRequest body:', req.body);

  // Only allow done_by update when marking as done by personnel
  if (done_by !== undefined) {
    db.query(
      "UPDATE requests SET done_by = ? WHERE id = ?",
      [done_by, id],
      (err, result) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
        res.status(200).json({ message: "Request done_by updated successfully" });
      }
    );
    return;
  }

  if (!date_needed || !type_of_concern || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query(
    "UPDATE requests SET date_needed = ?, type_of_concern = ?, description = ? WHERE id = ?",
    [date_needed, type_of_concern, description, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
      res.status(200).json({ message: "Request updated successfully" });
    }
  );
};

// DELETE REQUEST
exports.deleteRequest = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM requests WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Request deleted successfully" });
  });
};

const db = require("../db");

// BULK DELETE ALL REQUESTS
exports.deleteAllRequests = (req, res) => {
  db.query("DELETE FROM requests", (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.status(200).json({ message: "All requests deleted successfully" });
  });
};
// Filtered: Only requests approved by President (using status field only)
exports.listPresidentApprovedRequests = (req, res) => {
  db.query("SELECT id, status, requested_by, description, urgency FROM requests WHERE status = 'Approved'", (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.status(200).json(results);
  });
};
// TEMPORARY: List all requests for debugging
exports.listAllRequests = (req, res) => {
  db.query("SELECT id, status, requested_by, description, urgency FROM requests", (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.status(200).json(results);
  });
};
// ASSIGN PERSONNEL TO REQUEST
exports.assignPersonnel = (req, res) => {
  const { id } = req.params;
  const { personnelName, personnelRole } = req.body;
  if (!personnelName || typeof personnelName !== 'string' || !personnelName.trim()) {
    return res.status(400).json({ message: "Personnel name required" });
  }
  if (!personnelRole || typeof personnelRole !== 'string' || !personnelRole.trim()) {
    return res.status(400).json({ message: "Personnel role required" });
  }
  db.query(
    "UPDATE requests SET assigned_to = ?, assigned_personnel_name = ?, assigned_role = ? WHERE id = ?",
    [personnelName.trim(), personnelName.trim(), personnelRole.trim(), id],
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
  const { status, president_by, president_reject_reason } = req.body;
  if (!status) {
    return res.status(400).json({ message: "President decision required" });
  }
  let query = "UPDATE requests SET status = ?";
  let params = [status];
  if (status === "Rejected" && president_reject_reason) {
    query += ", president_reject_reason = ?";
    params.push(president_reject_reason);
  }
  query += " WHERE id = ?";
  params.push(id);
  db.query(
    query,
    params,
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
  const department = req.query.department;
  const assignedTo = req.query.assigned_to;
  const hasAssigned = req.query.has_assigned;

  let query = `SELECT * FROM requests`;
  let where = [];
  let values = [];

  if (role !== "Admin" && department) {
    where.push("department = ?");
    values.push(department);
  }
  if (assignedTo) {
    where.push("assigned_to = ?");
    values.push(assignedTo);
  }
  if (hasAssigned) {
    where.push("assigned_to IS NOT NULL AND assigned_to != ''");
    // Exclude requests marked as Done
    where.push("status != 'Done'");
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
      assigned_role: r.assigned_role || null,
      date_done: r.date_done ? formatDate(r.date_done) : null,
      proof_image: r.proof_image || null,
    }));

    res.status(200).json(formatted);
  });
};

// CREATE REQUEST
exports.createRequest = (req, res) => {
  const { user_id, date_filed, date_needed, type_of_concern, description, requested_by, urgency, department } = req.body;
  console.log('Received urgency:', urgency, 'Department:', department);
  if (!user_id || !date_filed || !date_needed || !type_of_concern || !description || !requested_by || !urgency || !department) {
    return res.status(400).json({ message: "All fields are required, including department" });
  }

  // Always set status, noted_by, and ppgshead to 'Pending' for new requests
  const status = 'Pending';
  const noted_by = 'Pending';
  const ppgshead = 'Pending';

  db.query(
    "INSERT INTO requests (user_id, date_filed, date_needed, type_of_concern, description, requested_by, urgency, department, status, noted_by, ppgshead) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [user_id, date_filed, date_needed, type_of_concern, description, requested_by, urgency, department, status, noted_by, ppgshead],
    (err, result) => {
      if (err) {
        console.error("DB error in createRequest:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }
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

  // If marking as done (either by personnel or admin), set date_done
  if ((done_by !== undefined) || (status && status.toLowerCase() === 'done')) {
    // Check if proof_image exists
    db.query("SELECT proof_image FROM requests WHERE id = ?", [id], (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (!rows[0] || !rows[0].proof_image) {
        return res.status(400).json({ message: "Proof image is required before marking as done" });
      }
      // Proceed with update
      let query, params;
      if (done_by !== undefined) {
        query = "UPDATE requests SET done_by = ?, status = 'Done', date_done = NOW() WHERE id = ?";
        params = [done_by, id];
      } else {
        query = "UPDATE requests SET status = 'Done', date_done = NOW() WHERE id = ?";
        params = [id];
      }
      db.query(query, params, (err, result) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
        res.status(200).json({ message: "Request marked as Done successfully" });
      });
    });
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

// UPLOAD PROOF IMAGE
exports.uploadProof = (req, res) => {
  const { id } = req.params;
  const requestId = parseInt(id, 10);
  if (!req.file) {
    return res.status(400).json({ message: "Proof image is required" });
  }
  const proofImage = req.file.filename;
  db.query(
    "UPDATE requests SET proof_image = ? WHERE id = ?",
    [proofImage, requestId],
    (err, result) => {
      if (err) {
        console.error("DB error in uploadProof:", err);
        return res.status(500).json({ message: "DB error", error: err.message });
      }
      if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
      res.status(200).json({ message: "Proof uploaded successfully", proofImage });
    }
  );
};

// REOPEN REQUEST
exports.reopenRequest = (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    return res.status(400).json({ message: "Reopen reason required" });
  }
  db.query(
    "UPDATE requests SET status = 'Approved', ppgshead = 'Approved', done_by = NULL, assigned_to = NULL, assigned_role = NULL, assigned_personnel_name = NULL, proof_image = NULL, reopen_reason = ? WHERE id = ?",
    [reason.trim(), id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
      res.status(200).json({ message: "Request reopened successfully" });
    }
  );
};

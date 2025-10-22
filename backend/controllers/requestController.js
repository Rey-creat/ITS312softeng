const db = require("../db");

// ✅ CREATE
exports.createRequest = (req, res) => {
  const { user_id, date_filed, date_needed, type_of_concern, description, requested_by } = req.body;

  if (!user_id || !date_filed || !date_needed || !type_of_concern || !description || !requested_by) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query(
    "INSERT INTO requests (user_id, date_filed, date_needed, type_of_concern, description, requested_by) VALUES (?, ?, ?, ?, ?, ?)",
    [user_id, date_filed, date_needed, type_of_concern, description, requested_by],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.status(201).json({ message: "Request created successfully", requestId: result.insertId });
    }
  );
};

// ✅ UPDATE
exports.updateRequest = (req, res) => {
  const { id } = req.params;
  const { date_needed, type_of_concern, description } = req.body;

  if (!date_needed || !type_of_concern || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query(
    "UPDATE requests SET date_needed = ?, type_of_concern = ?, description = ? WHERE id = ?",
    [date_needed, type_of_concern, description, id],
    (err, result) => {
      if (err) {
        console.error("❌ Update error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Request not found" });
      }
      res.status(200).json({ message: "Request updated successfully" });
    }
  );
};

// ✅ DELETE
exports.deleteRequest = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM requests WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("❌ Delete error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json({ message: "Request deleted successfully" });
  });
};

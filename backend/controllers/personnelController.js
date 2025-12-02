const db = require("../db");

// Get all personnel (users except Admin, President, DeptHead, PPGSHead)
exports.getPersonnel = (req, res) => {
  db.query(
    "SELECT id, fullname, role, department FROM users WHERE role NOT IN ('Admin', 'President', 'DeptHead', 'PPGSHead')",
    (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      res.status(200).json(results);
    }
  );
};

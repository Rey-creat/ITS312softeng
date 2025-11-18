const db = require("../db");

class Report {
  // Fetch all reports (Admin sees all, others only theirs)
  static getAll({ userId, role }) {
    return new Promise((resolve, reject) => {
      let query = `SELECT id, request_id, filed_by, type_of_concern AS concern, description, status,
                          current_approval_stage, is_fully_approved, date_reported, date_updated, created_at
                   FROM requests
                   ORDER BY date_reported DESC`;
      let values = [];

      if (role !== "Admin" && userId) {
        query = `SELECT id, request_id, filed_by, type_of_concern AS concern, description, status,
                        current_approval_stage, is_fully_approved, date_reported, date_updated, created_at
                 FROM requests WHERE user_id = ? ORDER BY date_reported DESC`;
        values = [userId];
      }

      db.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = Report;

const db = require("../db");

const formatDate = (date) => date.toISOString().split("T")[0];

exports.getDashboardStats = (req, res) => {
  const countsQuery = `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status='Completed' THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN status='Rejected' THEN 1 ELSE 0 END) AS rejected
    FROM requests
  `;
  const recentQuery = `
    SELECT id, type_of_concern, date_filed, date_needed, description, status
    FROM requests
    ORDER BY created_at DESC
    LIMIT 5
  `;

  db.query(countsQuery, (err, countsResult) => {
    if (err) {
      console.error("Error executing countsQuery:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    if (!countsResult || countsResult.length === 0) {
      return res.status(200).json({ counts: { total: 0, pending: 0, completed: 0, rejected: 0 }, recent: [] });
    }

    db.query(recentQuery, (err, recentResult) => {
      if (err) {
        console.error("Error executing recentQuery:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }

      const recentFormatted = recentResult.map(r => ({
        ...r,
        date_filed: formatDate(r.date_filed),
        date_needed: formatDate(r.date_needed),
      }));

      res.json({ counts: countsResult[0], recent: recentFormatted });
    });
  });
};

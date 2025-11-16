const db = require("../db");

const formatDate = (date) => date.toISOString().split("T")[0];

exports.getDashboardStats = (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ message: "user_id is required" });

  const countsQuery = `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status='Completed' THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN status='Rejected' THEN 1 ELSE 0 END) AS rejected
    FROM requests
    WHERE user_id = ?
  `;
  const recentQuery = `
    SELECT id, type_of_concern, date_filed, date_needed, description, status
    FROM requests
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 5
  `;

  db.query(countsQuery, [userId], (err, countsResult) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });

    db.query(recentQuery, [userId], (err, recentResult) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });

      const recentFormatted = recentResult.map(r => ({
        ...r,
        date_filed: formatDate(r.date_filed),
        date_needed: formatDate(r.date_needed),
      }));

      res.json({ counts: countsResult[0], recent: recentFormatted });
    });
  });
};

// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/authController");
const { getReports } = require("../controllers/reportController");

router.get("/reports", verifyToken, getReports);

module.exports = router;

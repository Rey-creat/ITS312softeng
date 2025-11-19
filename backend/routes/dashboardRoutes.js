const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/authController");
const { getDashboardStats } = require("../controllers/dashboardController");

router.get("/dashboard-stats", verifyToken, getDashboardStats);

module.exports = router;

const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController");

// GET all reports
router.get("/all-reports", reportsController.getAllReports);

module.exports = router;
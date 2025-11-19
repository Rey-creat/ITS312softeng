const express = require("express");
const router = express.Router();
const ppgsHeadController = require("../controllers/ppgsHeadController");

// GET approved requests for PPGS Head
router.get("/approved-requests", ppgsHeadController.getApprovedRequests);

// UPDATE request status to 'In Progress'
router.put("/requests/:id/in-progress", ppgsHeadController.markInProgress);

// UPDATE request status to 'Completed'
router.put("/requests/:id/completed", ppgsHeadController.markCompleted);

module.exports = router;
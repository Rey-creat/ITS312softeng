const express = require("express");
const router = express.Router();
const ppgsHeadController = require("../controllers/ppgsHeadController");

// GET approved requests for PPGS Head
router.get("/approved-requests", ppgsHeadController.getApprovedRequests);

// UPDATE request status to 'In Progress'
router.put("/requests/:id/in-progress", ppgsHeadController.markInProgress);

// UPDATE request status to 'Completed'
router.put("/requests/:id/completed", ppgsHeadController.markCompleted);

// APPROVE a request
router.put("/requests/:id/approve", ppgsHeadController.approveRequest);

// REJECT a request
router.put("/requests/:id/reject", ppgsHeadController.rejectRequest);

module.exports = router;
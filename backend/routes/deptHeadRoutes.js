const express = require("express");
const router = express.Router();
const deptHeadController = require("../controllers/deptHeadController");

// GET all requests
router.get("/all-requests", deptHeadController.getAllRequests);

// GET pending requests
router.get("/requests", deptHeadController.getPendingRequests);

// APPROVE a request
router.put("/requests/:id/approve", deptHeadController.approveRequest);

// REJECT a request
router.put("/requests/:id/reject", deptHeadController.rejectRequest);

// GET approved requests for PPGS Head
router.get("/approved-requests", deptHeadController.getApprovedRequests);

// UPDATE request status to 'In Progress'
router.put("/requests/:id/in-progress", deptHeadController.markInProgress);

// UPDATE request status to 'Completed'
router.put("/requests/:id/completed", deptHeadController.markCompleted);

module.exports = router;

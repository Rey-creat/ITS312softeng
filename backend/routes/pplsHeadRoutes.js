const express = require("express");
const router = express.Router();
const pplsHeadController = require("../controllers/pplsHeadController");

// GET completed requests for PPLS Head
router.get("/completed-requests", pplsHeadController.getCompletedRequests);

// UPDATE request status to 'Archived'
router.put("/requests/:id/archive", pplsHeadController.archiveRequest);

module.exports = router;
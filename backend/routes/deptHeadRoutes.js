const express = require("express");
const router = express.Router();
const deptHeadController = require("../controllers/deptHeadController");

// GET all requests
router.get("/all-requests", deptHeadController.getAllRequests);

// ADD 'Noted By' to a request
router.put("/requests/:id/noted", (req, res, next) => {
  console.log(`[DEBUG] PUT /requests/${req.params.id}/noted hit`);
  next();
}, deptHeadController.addNotedBy);

module.exports = router;

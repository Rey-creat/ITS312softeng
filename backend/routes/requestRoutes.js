const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/authController");
const {
  createRequest,
  updateRequest,
  deleteRequest,
  getRequests,
} = require("../controllers/requestController");

// CREATE - Protected
router.post("/requests", verifyToken, createRequest);

// READ (Admin or user) - Protected
router.get("/requests", verifyToken, getRequests);

// UPDATE - Protected
router.put("/requests/:id", verifyToken, updateRequest);

// PRESIDENT DECISION - Protected
router.put("/requests/:id/president", verifyToken, require("../controllers/requestController").setPresidentDecision);

// DELETE - Protected
router.delete("/requests/:id", verifyToken, deleteRequest);

module.exports = router;

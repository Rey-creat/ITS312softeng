const express = require("express");
const router = express.Router();
const {
  createRequest,
  updateRequest,
  deleteRequest,
  getRequests,
} = require("../controllers/requestController");

// CREATE
router.post("/requests", createRequest);

// READ (Admin or user)
router.get("/requests", getRequests);

// UPDATE
router.put("/requests/:id", updateRequest);

// DELETE
router.delete("/requests/:id", deleteRequest);

module.exports = router;

const express = require("express");
const router = express.Router();
const { createRequest, updateRequest, deleteRequest } = require("../controllers/requestController");

router.post("/requests", createRequest);
router.put("/requests/:id", updateRequest);
router.delete("/requests/:id", deleteRequest);

module.exports = router;

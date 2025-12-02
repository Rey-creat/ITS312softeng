const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/authController");
const { getPersonnel } = require("../controllers/personnelController");

router.get("/personnel", verifyToken, getPersonnel);

module.exports = router;

const express = require("express");
const router = express.Router();
const { register, login, logout, verifyToken, getSessionInfo, resetPassword } = require("../controllers/authController");
router.post("/reset-password", resetPassword);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.get("/session", verifyToken, getSessionInfo);

module.exports = router;

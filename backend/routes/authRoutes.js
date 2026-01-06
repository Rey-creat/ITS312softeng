const express = require("express");
const router = express.Router();

const { register, login, logout, verifyToken, getSessionInfo, resetPassword, directResetPassword } = require("../controllers/authController");
router.post("/reset-password", resetPassword);
router.post("/forgot-password", directResetPassword);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.get("/session", verifyToken, getSessionInfo);

module.exports = router;

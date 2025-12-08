const express = require("express");
const router = express.Router();

const { register, login, logout, verifyToken, getSessionInfo, resetPassword, directResetPassword } = require("../controllers/authController");
router.post("/reset-password", resetPassword);
router.post("/auth/direct-reset-password", directResetPassword);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.get("/session", verifyToken, getSessionInfo);

module.exports = router;

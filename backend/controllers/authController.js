// Direct password reset handler for /auth/direct-reset-password (no token, no email link)
const directResetPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and new password are required." });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "DB error", error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(400).json({ message: "No user found with that email." });
      }
      return res.status(200).json({ message: "Password reset successful." });
    });
  } catch (err) {
    return res.status(500).json({ message: "Error resetting password." });
  }
};
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const SECRET = process.env.JWT_SECRET || "YOUR_SECRET_KEY";

// Store active sessions
const activeSessions = new Map();

// Updated register function to handle multipart/form-data
const register = async (req, res) => {
  let { fullname, email, password, role, department } = req.body;

  console.log("[DEBUG] Register request body:", req.body);

  // Only require department for roles that need it
  const rolesRequiringDept = ["DeptHead", "Teacher", "Staff"];
  if (!fullname || !email || !password || !role) {
    return res.status(400).json({ message: "Full name, email, password, and role are required." });
  }
  if (rolesRequiringDept.includes(role) && !department) {
    return res.status(400).json({ message: "Department is required for this role." });
  }
  // For PPGSHead, President, and Personnel, set department to null if empty string or not provided
  if ((role === "PPGSHead" || role === "President" || role === "Personnel") && (!department || department === "")) {
    department = null;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (fullname, email, password, role, department) VALUES (?, ?, ?, ?, ?)`;
    const values = [fullname, email, hashedPassword, role, department];

    db.query(
      query,
      values,
      (err, result) => {
        if (err) {
          console.error("[ERROR] Registration failed:", err);
          return res.status(500).json({ message: "Registration failed." });
        }

        const userId = result.insertId;
        const token = jwt.sign(
          { id: userId, email, role },
          SECRET,
          { expiresIn: "24h" }
        );

        activeSessions.set(token, {
          userId,
          email,
          role,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        res.status(201).json({
          message: "Registered successfully",
          token,
          user: {
            id: userId,
            fullname,
            email,
            role,
            department,
          },
        });
      }
    );
  } catch (err) {
    console.error("[ERROR] Hashing password failed:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (!results.length) return res.status(400).json({ message: "Invalid email or password" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT token with expiration
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: "24h" }
    );

    // Store session with creation timestamp
    activeSessions.set(token, {
      userId: user.id,
      email: user.email,
      role: user.role,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.json({
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        department: user.department,
        profile_picture: user.profile_picture,
      },
      sessionInfo: {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        expiresIn: "24h",
      },
    });
  });
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify JWT signature and expiration
    const decoded = jwt.verify(token, SECRET);
    
    // Check if session exists in active sessions
    const session = activeSessions.get(token);

    if (!session) {
      return res.status(401).json({ message: "Session expired or invalid" });
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      activeSessions.delete(token);
      return res.status(401).json({ message: "Session expired" });
    }

    console.log("Token verified successfully for user:", decoded.id);

    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
};

// Logout - invalidate session
const logout = (req, res) => {
  const token = req.token;

  if (token) {
    activeSessions.delete(token);
    console.log("Session destroyed for token:", token.substring(0, 10) + "...");
    console.log("Active sessions remaining:", activeSessions.size);
  }

  res.json({ message: "Logged out successfully" });
};

// Get active sessions count
const getSessionInfo = (req, res) => {
  res.json({
    activeSessions: activeSessions.size,
    currentSession: {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

// Direct password reset handler for /reset-password (token-based or legacy)
const resetPassword = async (req, res) => {
  // Example implementation: expects email and newPassword
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ message: "Email and new password are required." });
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "DB error", error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(400).json({ message: "No user found with that email." });
      }
      return res.status(200).json({ message: "Password reset successful." });
    });
  } catch (err) {
    return res.status(500).json({ message: "Error resetting password." });
  }
};

// Export all handlers after all function definitions
module.exports = {
  register,
  login,
  logout,
  verifyToken,
  getSessionInfo,
  resetPassword,
  directResetPassword
};
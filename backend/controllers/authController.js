const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "YOUR_SECRET_KEY";

// Store active sessions
const activeSessions = new Map();

exports.register = async (req, res) => {
  const { fullname, email, password, role } = req.body;
  if (!fullname || !email || !password || !role) return res.status(400).json({ message: "All fields required" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)",
      [fullname, email, hashed, role],
      (err, result) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });
        res.status(201).json({ message: "Registered successfully" });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

exports.login = (req, res) => {
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
      },
      sessionInfo: {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        expiresIn: "24h",
      },
    });
  });
};

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
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
exports.logout = (req, res) => {
  const token = req.token;

  if (token) {
    activeSessions.delete(token);
    console.log("Session destroyed for token:", token.substring(0, 10) + "...");
    console.log("Active sessions remaining:", activeSessions.size);
  }

  res.json({ message: "Logged out successfully" });
};

// Get active sessions count
exports.getSessionInfo = (req, res) => {
  res.json({
    activeSessions: activeSessions.size,
    currentSession: {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

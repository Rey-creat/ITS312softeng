const express = require("express");
const cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Import routes
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const deptHeadRoutes = require("./routes/deptHeadRoutes");
const ppgsHeadRoutes = require("./routes/ppgsHeadRoutes");
const pplsHeadRoutes = require("./routes/pplsHeadRoutes");
const personnelRoutes = require("./routes/personnelRoutes");

const app = express();

// Middleware
app.use(cors());
// Ensure express.json() middleware is used for JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Root route
app.get("/", (req, res) => res.send("Backend running!"));

// Debugging middleware to log all requests
app.use((req, res, next) => {
  console.log(`[DEBUG] Incoming request: ${req.method} ${req.url}`);
  next();
});

// API routes
app.use("/api", authRoutes);
app.use("/api", requestRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", reportRoutes);
app.use("/api", personnelRoutes);
// User routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// DeptHead routes
app.use("/api/depthead", (req, res, next) => {
  console.log(`[DEBUG] DeptHead route hit: ${req.method} ${req.url}`);
  next();
});
app.use("/api/depthead", deptHeadRoutes);

// PPGS Head routes
app.use("/api/ppgshead", (req, res, next) => {
  console.log(`[DEBUG] PPGSHead route hit: ${req.method} ${req.url}`);
  next();
});
app.use("/api/ppgshead", ppgsHeadRoutes);
// app.use("/api/president", require("./routes/presidentRoutes"));

// PPLS Head routes
app.use("/api/pplshead", (req, res, next) => {
  console.log(`[DEBUG] PPLSHead route hit: ${req.method} ${req.url}`);
  next();
});
app.use("/api/pplshead", pplsHeadRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`[DEBUG] Unmatched route: ${req.method} ${req.url}`);
  res.status(404).send("Route not found");
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

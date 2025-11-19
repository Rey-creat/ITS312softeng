const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const deptHeadRoutes = require("./routes/deptHeadRoutes"); // ✅ Import it
const ppgsHeadRoutes = require("./routes/ppgsHeadRoutes"); // ✅ Import PPGS Head routes
const pplsHeadRoutes = require("./routes/pplsHeadRoutes"); // ✅ Import PPLS Head routes
const reportsRoutes = require("./routes/reportsRoutes"); // ✅ Import Reports routes

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Backend running!"));

// Existing routes
app.use("/api", authRoutes);
app.use("/api", requestRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", reportRoutes);

// ✅ Dept Head routes
app.use("/api/depthead", deptHeadRoutes);

// ✅ PPGS Head routes
app.use("/api/ppgshead", ppgsHeadRoutes);

// ✅ PPLS Head routes
app.use("/api/pplshead", pplsHeadRoutes);

// ✅ Reports routes
app.use("/api/reports", reportsRoutes);

// Debug unmatched routes
app.use((req, res) => {
  console.log(`[DEBUG] Unmatched route: ${req.method} ${req.url}`);
  res.status(404).send("Route not found");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

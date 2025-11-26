const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const deptHeadRoutes = require("./routes/deptHeadRoutes"); 
const ppgsHeadRoutes = require("./routes/ppgsHeadRoutes"); 
const pplsHeadRoutes = require("./routes/pplsHeadRoutes"); 
const reportsRoutes = require("./routes/reportsRoutes"); 

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Backend running!"));

// Debugging middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`[DEBUG] Incoming request: ${req.method} ${req.url}`);
  next();
});

// Existing routes
app.use("/api", authRoutes);
app.use("/api", requestRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", reportRoutes);
app.use("/api/depthead", deptHeadRoutes);
app.use("/api/ppgshead", ppgsHeadRoutes);
app.use("/api/pplshead", pplsHeadRoutes);
app.use("/api/reports", reportsRoutes);

app.use((req, res) => {
  console.log(`[DEBUG] Unmatched route: ${req.method} ${req.url}`);
  res.status(404).send("Route not found");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

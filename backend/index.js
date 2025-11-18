const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Backend running!"));

app.use("/api", authRoutes);
app.use("/api", requestRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", reportRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

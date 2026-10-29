
require("dotenv").config();

const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));

// API routes
app.use("/api/listings", require("./routes/listings"));
app.use("/api/village-pools", require("./routes/villagePools"));
app.use("/api/crops", require("./routes/crops"));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fair Harvest backend is running",
    timestamp: new Date().toISOString()
  });
});

// Unknown endpoint
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

app.listen(PORT, () => {
  console.log(`Fair Harvest API running at http://localhost:${PORT}`);
});

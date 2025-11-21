require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth");
const resumeRoutes = require("./src/routes/resume");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Static serve uploaded files (optional)
// In production use S3 or other secure file storage instead.
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "../uploads");
app.use("/uploads", express.static(UPLOAD_DIR));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);

// Example test endpoint: returns the sample uploaded file path from your session
// (This uses the exact local path captured earlier; your deployment will transform it).
app.get("/api/example-file", (req, res) => {
  res.json({
    filename: "6961b1f7-4184-4285-aebb-732c410342fb.png",
    file_url: "/mnt/data/6961b1f7-4184-4285-aebb-732c410342fb.png"
  });
});

// Connect DB and start server
connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/resumeapp");

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}🚀`);
});

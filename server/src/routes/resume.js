const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const auth = require("../middleware/auth");
const Resume = require("../models/Resume");
const Prediction = require("../models/Prediction");

// upload directory from env
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "../../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = Date.now() + "_" + file.originalname.replace(/\s+/g, "_");
    cb(null, safe);
  }
});
const upload = multer({ storage });

/**
 * Upload resume, forward to ML API, save resume & prediction
 * - protected endpoint (requires JWT)
 */
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file" });

    // 1) Save resume document in DB
    const resumeDoc = new Resume({
      userId,
      filename: file.originalname,
      storagePath: path.resolve(file.path)
    });
    await resumeDoc.save();

    // 2) Forward file to ML API (ml_api) using form-data
    const mlApiBase = process.env.ML_API_URL || "http://localhost:8000";
    const form = new FormData();
    form.append("file", fs.createReadStream(file.path), file.originalname);

    const mlRes = await axios.post(`${mlApiBase}/analyze/file`, form, {
      headers: {
        ...form.getHeaders()
      },
      maxBodyLength: Infinity,
      timeout: 120000
    });

    // 3) Save prediction in DB
    const predictionDoc = new Prediction({
      resumeId: resumeDoc._id,
      userId,
      result: mlRes.data
    });
    await predictionDoc.save();

    // 4) Return combined response
    res.json({
      resume: resumeDoc,
      prediction: predictionDoc,
      ml_response: mlRes.data
    });
  } catch (err) {
    console.error("upload error", err?.response?.data || err.message || err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get predictions for a user
 */
router.get("/predictions/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const preds = await Prediction.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json(preds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get a specific prediction by id
 */
router.get("/prediction/:id", auth, async (req, res) => {
  try {
    const pred = await Prediction.findById(req.params.id);
    if (!pred) return res.status(404).json({ message: "Not found" });
    res.json(pred);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

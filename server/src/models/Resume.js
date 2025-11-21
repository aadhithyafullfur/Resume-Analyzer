const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  filename: String,
  storagePath: String, // local path or cloud URL
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Resume", ResumeSchema);

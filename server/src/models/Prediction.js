const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema({
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  result: Object, // store ML API JSON response
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Prediction", PredictionSchema);

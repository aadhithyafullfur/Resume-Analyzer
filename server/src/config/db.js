const mongoose = require("mongoose");

async function connectDB(uri) {
  const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  try {
    await mongoose.connect(uri, opts);
    console.log("MongoDB (Atlas) connected ✅");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // Retry logic (simple)
    setTimeout(() => connectDB(uri), 5000);
  }
}

module.exports = connectDB;

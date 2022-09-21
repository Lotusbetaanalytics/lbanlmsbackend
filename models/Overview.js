const mongoose = require("mongoose");

const OverviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  test: {
    type: mongoose.Schema.ObjectId,
    ref: "ETest",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  report: { type: Array },
  status: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Overview", OverviewSchema);

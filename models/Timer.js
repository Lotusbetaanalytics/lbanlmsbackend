const mongoose = require("mongoose");

const TimerSchema = new mongoose.Schema({
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

  time: {
    type: Number,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Timer", TimerSchema);

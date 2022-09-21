const mongoose = require("mongoose");

const GradeSchema = new mongoose.Schema({
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
  question: [
    {
      question: {
        type: mongoose.Schema.ObjectId,
        ref: "Test",
        required: true,
      },
      category: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Grade", GradeSchema);

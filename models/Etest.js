const mongoose = require("mongoose");

const ETestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add Test Name"],
  },
  categories: [
    {
      category: {
        type: mongoose.Schema.ObjectId,
        ref: "QuestionCategory",
        required: true,
      },
      count: { type: Number },
    },
  ],
  random: {
    type: Boolean,
    required: true,
    default: true,
  },
  maxQuestion: {
    type: Number,
  },
  time: {
    type: Number,
  },
  passMark: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ETest", ETestSchema);

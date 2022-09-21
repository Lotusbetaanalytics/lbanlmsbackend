const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add Course Name"],
    unique: true,
  },
  description: {
    type: String,
    required: [true, "Please add Description"],
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
  },
  author: {
    type: String,
  },
  thumbnail: {
    type: String,
    default: "thumbnail.jpg",
  },
  section: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Section",
    },
  ],
  students: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  status: {
    type: String,
    required: true,
    enum: ["Draft", "Published"],
    default: "Draft",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Course", CourseSchema);

// const mongoose = require("mongoose");

// const CourseSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, "Please add Course Name"],
//     unique: true,
//   },
//   description: {
//     type: String,
//     required: [true, "Please add Description"],
//   },
//   category: {
//     type: String,
//   },
//   author: {
//     type: String,
//   },
//   thumbnail: {
//     type: String,
//     default: "thumbnail.jpg",
//   },
//   video: {
//     type: String,
//   },
//   section: [
//     {
//       section: {
//         type: mongoose.Schema.ObjectId,
//         ref: "Section",
//         // required: true,
//       },
//     },
//   ],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("Course", CourseSchema);

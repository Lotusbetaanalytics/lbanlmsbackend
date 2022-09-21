const express = require("express");
const {
  createCourse,
  getCourses,
  getSingleCourse,
} = require("../controllers/course");
const Course = require("../models/Course");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router
  .route("/")
  .post(protect, createCourse)
  .get(
    protect,
    advancedResults(Course, [
      {
        path: "category",
        select: "name description",
      },
      {
        path: "section",
        select: "name description video",
      },
      {
        path: "students",
        select: "firstname lastname email",
      },
      {
        path: "section.video",
        select: "name description video",
      },
    ]),
    getCourses
  );
router.route("/:id").get(protect, getSingleCourse);

module.exports = router;

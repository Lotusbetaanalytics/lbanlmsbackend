const express = require("express");
const {
  createTest,
  getTests,
  getCourseTest,
  getTest,
  gradeUser,
  getMyResult,
  deleteEtest,
} = require("../controllers/test");
const ETest = require("../models/Etest");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router
  .route("/")
  .post(protect, createTest)
  .get(protect, advancedResults(ETest), getTests);
router.route("/:id").get(protect, getTest).delete(protect, deleteEtest);
router.route("/grade").post(protect, gradeUser);
router.route("/grade/:id").get(protect, getMyResult);

module.exports = router;

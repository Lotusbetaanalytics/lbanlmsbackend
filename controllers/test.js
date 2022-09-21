const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ETest = require("../models/Etest");
const Question = require("../models/Question");
const Grade = require("../models/Grade");
const Overview = require("../models/Overview");
const User = require("../models/User");
const Log = require("../models/Logs");
const QuestionCategory = require("../models/QuestionCat");
const Timer = require("../models/Timer");
const sendEmail = require("../utils/sendEmail");

// @desc    Create User
// @route   POST/api/v1/User/
// @access   Private/Admin
exports.createTest = asyncHandler(async (req, res, next) => {
  const upload = await ETest.create(req.body);
  await Log.create({
    user: req.user.id,
    activity: "Created Test",
  });
  res.status(201).json({
    success: true,
    data: upload,
  });
});

// @desc    Get ALl Courses
// @route   POST/api/v1/employee
// @access   Private/Admin
exports.getTests = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get ALl Courses
// @route   POST/api/v1/employee
// @access   Private/Admin
exports.getCourseTest = asyncHandler(async (req, res, next) => {
  const section = await ETest.find({ course: req.params.course }).populate({
    path: "section",
    select: "name instruction",
  });
  res.status(200).json({
    success: true,
    data: section,
  });
});

// @desc    Get ALl Courses
// @route   POST/api/v1/employee
// @access   Private/Admin
exports.getTest = asyncHandler(async (req, res, next) => {
  const section = await ETest.findById(req.params.id).populate({
    path: "categories.category",
    select: "name instruction time",
  });
  var now = new Date();
  now.setMinutes(now.getMinutes() + section?.time); // timestamp
  now = new Date(now); // Date object

  var time = now.getTime();
  let questions = [];
  for (let i = 0; i < section?.categories?.length; i++) {
    const qst = await Question.find({
      category: section?.categories[i]?.category,
    }).populate({
      path: "category",
      select: "name",
    });
    qst.sort(() => Math.random() - 0.5);
    const randomQuestions = qst.slice(0, section?.categories[i]?.count);
    questions.push(...randomQuestions);
  }
  await Log.create({
    user: req.user.id,
    activity: "Started Test",
  });
  const checkTime = await Timer.findOne({
    user: req.user.id,
    test: req.params.id,
  });

  if (checkTime) {
    res.status(200).json({
      success: true,
      data: questions,
      time: checkTime.time,
    });
  } else {
    await Timer.create({
      user: req.user.id,
      test: req.params.id,
      time: time,
    });
    res.status(200).json({
      success: true,
      data: questions,
      time: time,
    });
  }
});

exports.gradeUser = asyncHandler(async (req, res, next) => {
  const exist = await Grade.findOne({
    user: req.user.id,
    test: req.body.test,
  });

  const completed = await Overview.findOne({
    user: req.user.id,
    test: req.body.test,
  });
  if (completed) {
    return next(
      new ErrorResponse(
        `Sorry!, You can only attempt this Test Once, Contact your Administrator`,
        400
      )
    );
  }
  req.body.user = req.user;
  const test = await Question.findById(req.body.question);

  let score;
  if (test.correctAnswer === req.body.answer) {
    score = 1;
  } else {
    score = 0;
  }
  if (exist) {
    const question = exist.question;
    const existItem = question.find((x) => x.question == req.body.question);

    const updates = {
      _id: existItem?._id,
      score: score,
      question: req.body.question,
      answer: req.body.answer,
      category: req.body.category,
    };

    if (existItem) {
      const newQst = question.map((x) => (x === existItem ? updates : x));
      await Grade.findByIdAndUpdate(
        exist._id,
        {
          question: newQst,
        },
        {
          new: true,
          runValidators: true,
        }
      );
      res.status(200).json({
        success: true,
      });
      return;
    } else {
      const update = [
        {
          score: score,
          question: req.body.question,
          answer: req.body.answer,
          category: req.body.category,
        },
      ];
      question.push(...update);
    }
    await Grade.findByIdAndUpdate(
      exist._id,
      {
        question: question,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      success: true,
    });
  } else {
    const question = [];

    const update = [
      {
        question: req.body.question,
        score: score,
        answer: req.body.answer,
        category: req.body.category,
      },
    ];
    question.push(...update);
    req.body.question = question;
    await Grade.create(req.body);
    res.status(201).json({
      success: true,
    });
  }
});

exports.getMyResult = asyncHandler(async (req, res, next) => {
  const assignedTest = await ETest.findById(req.params.id);
  const section = await Grade.findOne({
    user: req.user.id,
    test: req.params.id,
  });

  const total = section.question.reduce((a, c) => a + c.score, 0);
  const cal = section.question.length / 100;
  const percentage = total / cal;
  let status = "";

  let testSections = [];
  for (let i = 0; i < assignedTest?.categories.length; i++) {
    let sections = section?.question.filter(
      (x) =>
        x.category.toString() ==
        assignedTest?.categories[i]?.category.toString()
    );
    const sectionTotal = sections.reduce((a, c) => a + c.score, 0);
    const categoryName = await QuestionCategory.findById(
      assignedTest?.categories[i]?.category
    );
    const sCal = sections.length / 100;
    const sPercentage = sectionTotal / sCal;
    const sectionScore = {
      section: categoryName.name,
      score: sectionTotal,
      count: assignedTest?.categories[i]?.count,
      percentage: sPercentage,
    };
    testSections.push(sectionScore);
  }

  if (percentage >= assignedTest.passMark) {
    status = "Pass";
  } else {
    status = "Fail";
  }
  const user = req.user.id;
  const course = req.params.id;
  const score = percentage;
  const overInfo = await Overview.findOne({ user: req.user.id, test: course });
  if (overInfo) {
    await Overview.findByIdAndUpdate(
      overInfo._id,
      {
        user: user,
        test: course,
        score: Math.round(score),
        status: status,
        report: testSections,
      },
      {
        new: true,
        runValidators: true,
      }
    );
  } else {
    await Overview.create({
      user: user,
      test: course,
      score: Math.round(score),
      status: status,
      report: testSections,
    });
  }

  await Log.create({
    user: user,
    activity: "Checked Result",
  });

  const userInfo = await User.findById(req.user.id);
  const completedTest = userInfo.completedTest;
  const existItem = completedTest.find((x) => x == req.params.id);

  if (existItem) {
    completedTest.map((x) => (x === existItem ? req.params.id : x));
  } else {
    completedTest.push(req.params.id);
  }

  await User.findByIdAndUpdate(
    req.user.id,
    {
      completedTest: completedTest,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  const admin = await User.find({ role: "Admin" });

  const emails = [];
  for (let i = 0; i < admin.length; i++) {
    emails.push(admin[i].email);
  }
  const salutation = `Hello Admin`;
  const content = `${userInfo.firstname} has completed his test<br /><br />
    <h3>Score: ${percentage}</h3>
  `;
  res.status(200).json({
    success: true,
    data: section,
    percentage,
    status,
    report: testSections,
  });
  try {
    await sendEmail({
      email: emails,
      subject: "Test Result",
      salutation,
      content,
    });
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc    Get ALl Courses
// @route   POST/api/v1/employee
// @access   Private/Admin
exports.deleteEtest = asyncHandler(async (req, res, next) => {
  const section = await ETest.findById(req.params.id);
  section.remove();
  await Log.create({
    user: req.user.id,
    activity: "Deleted Test",
  });
  res.status(200).json({
    success: true,
    data: {},
  });
});

const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const Log = require("../models/Logs");
const Course = require("../models/Course");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// @desc    Create User
// @route   POST/api/v1/User/
// @access   Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const staff = await User.create(req.body);
  await Log.create({
    user: staff._id,
    activity: "created an account",
  });
  res.status(201).json({
    success: true,
    data: staff,
  });
});

// @desc    Get ALl User
// @route   POST/api/v1/employee
// @access   Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Login User
// @route   POST/api/v1/employee/login
// @access   Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please Provide email and password", 400));
  }
  //check for user
  const user = await User.findOne({ email: email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  //check if password match
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route  GET /api/v1/auth/logout
// @access   Private

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get current logged in user
// @route   POST/api/v1/auth/me
// @access   Private

exports.getMe = asyncHandler(async (req, res, next) => {
  const staff = await User.findById(req.user.id).populate([
    {
      path: "assignedCourse",
      select: "name thumbnail author category section status description",
    },
    {
      path: "assignedTest",
      select: "name maxQuestion passMark",
    },
  ]);
  res.status(200).json({
    success: true,
    data: staff,
  });
});

// @desc    Reset Password
// @route   PUT/api/v1/employee/:resettoken
// @access   Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.body.id)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse("Invalid Token", 400));
  }
  // set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot Password
// @route   POST/api/v1/employee/forgotpassword
// @access   Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ name: req.body.name });
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }
  //Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/staff/resetPassword/${resetToken}`;

  const salutation = `Hello There!`;
  const content = ` You are receiving this email because you (or someone else) has requested
    the reset of a password, Click on the link below to reset your password 
    <br />
    <br />
    <a href="${resetUrl}" style="padding:1rem;color:white;background:green;border-radius:20px;">Click Here</a>`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      salutation,
      content,
    });
    res.status(200).json({ success: true, data: "Email Sent" });
  } catch (err) {
    console.log(err);
    user.getResetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

// @desc    Delete Employee
// @route   POST/api/v1/employee/
// @access   Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new ErrorResponse("An Error Occured, Try Again", 400));
  }
  await Log.create({
    user: user,
    activity: `was deleted by ${req.user.firstname}`,
  });
  res.status(200).json({
    success: true,
  });
});

// @desc    Update Employee
// @route   POST/api/v1/employee/
// @access   Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new ErrorResponse("An Error Occured, Try Again", 400));
  }
  await Log.create({
    user: user,
    activity: "Updated Profile",
  });
  res.status(200).json({
    success: true,
  });
});

// @desc    Update Employee
// @route   POST/api/v1/employee/
// @access   Private/Admin
exports.AssignCourse = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  const courses = await Course.findById(req.body.course);
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }
  const course = user.assignedCourse;
  const student = courses.students;

  course.push(req.body.course);

  const updateUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      assignedCourse: course,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  student.push(req.params.id);
  const updateCourse = await Course.findByIdAndUpdate(
    req.body.course,
    {
      students: student,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  await Log.create({
    user: user,
    activity: "was Assigned Course",
  });

  res.status(200).json({
    success: true,
  });
});

// @desc    Update Employee
// @route   POST/api/v1/employee/
// @access   Private/Admin
exports.AssignTest = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }
  const course = user.assignedTest;

  course.push(req.body.test);

  const updateUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      assignedTest: course,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  await Log.create({
    user: user,
    activity: "was Assigned Test",
  });

  res.status(200).json({
    success: true,
  });
});

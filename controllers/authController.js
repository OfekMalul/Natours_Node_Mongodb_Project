const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModal');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

generateJWT = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  // Creating jwt when a user singing in. We added a secret and expression time (90 days)
  const token = generateJWT(newUser);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // checks if we got password and email
  if (!email || !password) {
    return next(new AppError('Please provide both password and email', 400));
  }
  // checks if we have a user with that email and password, +password allows us to select it from the db even though it selected as false in our modal.
  const user = await User.findOne({ email }).select('+password');

  // if no user or the password is incorrect
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email or password is incorrect', 401));
  }

  const token = generateJWT(user);
  res.status(200).json({
    status: 'success',
    token,
    user,
  });
});

exports.authenticatedUser = catchAsync(async (req, res, next) => {
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }
  // varifing the key + make it async fucntion by using promisify
  // it will return us the decoded payload
  // the decode payload holds id, login time, expression date
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  //checking if the user stil exist
  const user = await User.findById(decoded.id);

  next();
});

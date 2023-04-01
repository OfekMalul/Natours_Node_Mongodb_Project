const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('./../models/userModal');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendMail = require('./../utils/email');

const generateJWT = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  // Creating jwt when a user singing/ loging in/ reset password /update password. We added a secret and expression time (90 days)
  const token = generateJWT(user);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false, // the cookie is sent only on secure enccryption (https)
    httpOnly: true, // the cookie would not be able to accessed or modified by the browser
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  //removing the user password from the response
  user.password = undefined;
  res.cookie('jwt', token, cookieOptions);
  return res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt,
  });
  createSendToken(newUser, 201, res);
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
    return next(new AppError('Password is incorrect', 401));
  }
  createSendToken(user, 200, res);
});

exports.authenticatesUser = catchAsync(async (req, res, next) => {
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

  // checks if the user stil exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('User beloging to this token does not exist.', 401)
    );
  }
  // checks if the user changed the password after the token was issued
  // iat is the time of token issued
  const passwordChanged = currentUser.passwordChanged(decoded.iat);
  if (passwordChanged) {
    return next(new AppError('Password changed, log in again.', 401));
  }

  // user granted access to the protected route
  req.user = currentUser;
  next();
});

//passing the roles from the router to the middlware
exports.restrictTo = (...roles) => {
  //anonymous middleware
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `You must be ${roles.length > 1 ? 'an' : 'a'} ${roles.join(
            ' or '
          )} to do this action.`,
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(`User is not existed`, 404));
  }
  //generating a random token for the user
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // saves the new encryptedResetToken + the expires time to the document
  // sending email to the user
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and password confirm to:
   ${resetURL}.\nIf you didnt forget your password please ignore this email`;

  try {
    await sendMail({
      email: user.email,
      subject: 'Your password reset (token is valid for 10 minutes)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token send to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later.',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token not found or the token is expired.', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});
// we already know that the user exist as we check the user first with authenticatesUser.
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  //checks if the users password is correct prior to update
  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    return next(new AppError('Incorrect password!', 401));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;

  // we save and do not use the findOneByIdAndUpdate because our validators will not run and other schema pre mthods will not run as well.
  await user.save();

  createSendToken(user, 200, res);
});

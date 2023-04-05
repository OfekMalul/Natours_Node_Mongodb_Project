const AppError = require('../utils/appError');
const User = require('./../models/userModal');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (userObj, ...allowedFields) => {
  const fields = [...allowedFields];
  const newObj = {};
  Object.keys(userObj).forEach((fieldName) => {
    if (fields.includes(fieldName)) {
      newObj[fieldName] = userObj[fieldName];
    }
  });
  return newObj;
};

//2)Route handlers
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'yet to be implemented',
  });
};

// This functionality is to update data about the user
exports.updateMe = catchAsync(async (req, res, next) => {
  // create an error if the user tries to update the passwrod
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Cannot update password in this route. To update password please use the route /updatePassword',
        400
      )
    );
  }
  // update the user document by findByIdAndUpdate
  // there is no need to run validatiors as we dont change password
  // we getting the user from the authenticatesUser that runs before this function
  const filteredBody = filterObj(req.body, 'name', 'email'); // we dont want to let the user to update all the fields that he pass in the body so we filter it.
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    // runValidatiors set to true means we going to run the validators in the schema.
    // new set to true, returns the update document to the user
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = factory.getOne(User);
// updateUser is not suitable to update user
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const User = require('./../models/userModal');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   // has access to the request, current file, and a callback function
//   destination: (req, file, cb) => {
//     // the callback receives an error (if there is any) and the destination
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // looks to get a unique identifier
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// for image processing it is best not to save the file to the disk but to the memory
const multerStorage = multer.memoryStorage();

// tests if the current upload file is indeed an image
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('You can only upload images!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//upload.single(field), the single means we are only gettin 1 single file and not multiple
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  // if there is no file uploaded to resize
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

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

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'yet to be implemented',
  });
};

// This functionality is to update data about the user
exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
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
  if (req.file) filteredBody.photo = req.file.filename;

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

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// updateUser is not suitable to update user
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

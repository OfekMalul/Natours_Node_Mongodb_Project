const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('./../controllers/userController');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  authenticatesUser,
} = require('./../controllers/authController');

const route = express.Router();

//authentication
route.route('/signup').post(signup);
route.route('/login').post(login);
route.route('/forgotPassword').post(forgotPassword);
route.route('/resetPassword/:token').patch(resetPassword);
route.route('/updatePassword').patch(authenticatesUser, updatePassword);

//crud operations
route.route('/').get(getAllUsers).post(createUser);
route.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = route;

const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('./../controllers/userController');
const { signup } = require('./../controllers/authController');

const route = express.Router();

//authentication
route.route('/signup').post(signup);

//crud operations
route.route('/').get(getAllUsers).post(createUser);
route.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = route;

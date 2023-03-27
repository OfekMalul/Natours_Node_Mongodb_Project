const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateMe,
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

const router = express.Router();

//authentication
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);
router.route('/updatePassword').patch(authenticatesUser, updatePassword);

//updating user inforomation
router.patch('/updateMe', authenticatesUser, updateMe);

//crud operations
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;

const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  getMe,
  updateMe,
  deleteMe,
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

//updating or getting the current user inforomation
router.get('/me', authenticatesUser, getMe, getUser);
router.patch('/updateMe', authenticatesUser, updateMe);
router.route('/deleteMe').delete(authenticatesUser, deleteMe);

//crud operations
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;

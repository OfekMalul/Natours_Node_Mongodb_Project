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
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  authenticatesUser,
  restrictTo,
} = require('./../controllers/authController');

const router = express.Router();

//authentication
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);
router.route('/updatePassword').patch(authenticatesUser, updatePassword);

// all the routes after this middlewear will be authenticated
router.use(authenticatesUser);

//updating or getting the current user inforomation
router.get('/me', getMe, getUser);
router.patch('/updateMe', updateMe);
router.route('/deleteMe').delete(deleteMe);

// All the routes bellow would be accessed only by an admin
router.use(restrictTo('admin'));

//crud operations
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;

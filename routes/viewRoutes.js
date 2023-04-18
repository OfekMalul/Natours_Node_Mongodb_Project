const express = require('express');
const {
  getOverview,
  getTour,
  getLogin,
  getAccount,
} = require('../controllers/viewController');

const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, getOverview);
router.get('/tour/:slug', authController.isLoggedIn, getTour);
router.get('/login', authController.isLoggedIn, getLogin);
router.get('/me', authController.authenticatesUser, getAccount);

module.exports = router;

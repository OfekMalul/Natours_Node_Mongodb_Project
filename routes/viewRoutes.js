const express = require('express');
const {
  getOverview,
  getTour,
  getLogin,
} = require('../controllers/viewController');

const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', getOverview);
router.get('/tour/:slug', authController.authenticatesUser, getTour);
router.get('/login', getLogin);
module.exports = router;

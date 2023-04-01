const expresss = require('express');

const {
  getAllReviews,
  createReview,
} = require('./../controllers/reviewController');

const {
  restrictTo,
  authenticatesUser,
} = require('./../controllers/authController');
const router = expresss.Router();

router.route('/').get(getAllReviews);
router
  .route('/createReview')
  .post(authenticatesUser, restrictTo('user'), createReview);

module.exports = router;

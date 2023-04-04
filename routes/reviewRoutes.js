const expresss = require('express');
const {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('./../controllers/reviewController');
const {
  restrictTo,
  authenticatesUser,
} = require('./../controllers/authController');
const router = expresss.Router({ mergeParams: true }); // allows the params to go through, for ex' the tour id from the tours router.

router.route('/').get(getAllReviews);
router.route('/').post(authenticatesUser, restrictTo('user'), createReview);
router.route('/:id').patch(updateReview).delete(deleteReview);

module.exports = router;

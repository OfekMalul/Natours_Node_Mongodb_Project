const expresss = require('express');
const {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  setTourUserIds,
} = require('./../controllers/reviewController');
const {
  restrictTo,
  authenticatesUser,
} = require('./../controllers/authController');
const router = expresss.Router({ mergeParams: true }); // allows the params to go through, for ex' the tour id from the tours router.

// all paths are authenticated below this middleware
router.use(authenticatesUser);

router.route('/').get(getAllReviews);
router.route('/').post(restrictTo('user'), setTourUserIds, createReview);
router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

module.exports = router;

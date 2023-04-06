const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
} = require('./../controllers/tourController');

const {
  authenticatesUser,
  restrictTo,
} = require('./../controllers/authController');

const router = express.Router();

const reviewRouter = require('./../routes/reviewRoutes');
router.use('/:tourId/reviews', reviewRouter); //continues the route in the reviewRoutes

router
  .route('/')
  .get(getAllTours)
  .post(authenticatesUser, restrictTo('admin', 'lead-guide'), createTour);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authenticatesUser,
    restrictTo('admin', 'lead-guide', 'guide'),
    getMonthlyPlan
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router
  .route('/:id')
  .get(getTour)
  .patch(authenticatesUser, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(authenticatesUser, restrictTo('admin', 'lead-guide'), deleteTour);
module.exports = router;

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
} = require('./../controllers/tourController');
const {
  authenticatesUser,
  restrictTo,
} = require('./../controllers/authController');
const router = express.Router();

//creating a middleware that will be invoked upon request of tours with specific id
// router.param('id', checkId);

router.route('/').get(authenticatesUser, getAllTours);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/').get(getAllTours).post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(authenticatesUser, restrictTo('admin', 'lead-guide'), deleteTour);
module.exports = router;
const Tour = require('../models/tourModel');
const User = require('../models/userModal');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'name review rating',
  });
  if (!tour) {
    return next(
      new AppError(`There is no tour with the name ${req.params.slug}`, 404)
    );
  }
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLogin = async (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = async (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

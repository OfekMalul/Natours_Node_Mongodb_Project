const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewsSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please add text'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide rating'],
      min: 1,
      max: 5,
      default: 5,
      enum: [1, 2, 3, 4, 5],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// achives that each tour can only have one review from each user. // 1 means that it is asc order
reviewsSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewsSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// statics method to calc the avarage rating reviews for each tour
reviewsSchema.statics.calcAverageRatings = async function (tourId) {
  // the this keyword points to the current model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour', // this is the tour id that comes from the review
        nRatings: { $sum: 1 },
        avgRatings: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRatings,
      ratingsQuantity: stats[0].nRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

// post middlewear as we wish the document to save to the db first
reviewsSchema.post('save', function () {
  // this points to the current review
  // this.constructor, the constructor points to the current model

  this.constructor.calcAverageRatings(this.tour);
});

reviewsSchema.pre(/findOneAnd/, async function (next) {
  // this keyword points to a query
  this.rReview = await this.findOne(); // this.rReview now is the document that was found
  next();
});

reviewsSchema.post(/^findOneAnd/, async function () {
  await this.rReview.constructor.calcAverageRatings(this.rReview.tour);
});

const Review = mongoose.model('Review', reviewsSchema);
module.exports = Review;

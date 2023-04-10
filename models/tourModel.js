const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

//here we are creating a schema for our documents.
const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlenght: [40, 'A tour must have at most 40 characters'],
      minlength: [10, 'A tour must have at least 10 characters'],
      validate: {
        validator: function () {
          let regex = /^[A-Za-z\s]*$/;
          return this.name.match(regex);
        },
        message: 'Tour name can only contain alphanumeric characters',
      },
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maxGrooupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Diffculty is either easy medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Rating must be below 5'],
      min: [1, 'Rating must be above 1'],
      // runs each time a new value is received to ratingsAverage field
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this key word point to the new document
          return val < this.price;
        },
        message: 'Discount cannot be greater than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    //this means the images is array of strings
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    //Array of dates
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      description: String,
      //GeoJson
      type: {
        type: String, // the type must to be a point type
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // types is array of numbers.
      address: String,
    },
    locations: [
      //GeoJson
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        desctiption: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', //references the User modal -- there is no need to import it to the file.
      },
    ],
  },
  {
    //this is the options for our shcema
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// indexing the tour schema accoriding to ascending price and descending ratings
toursSchema.index({ price: 1, ratingsAverage: -1 });
toursSchema.index({ slug: 1 });
toursSchema.index({ startLocation: '2dsphere' });

//The virtual property will be created each time we getting data from our db
// we use a regular function expression as we need the this keyword that refers to the current document
toursSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual populate
toursSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // this is the forign key in the review modal
  localField: '_id', // this is the primary key in the tours modal
});

//document middleware, runs before the save() and create() method
toursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// toursSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guideesPromises);
//   next();
// });
//query middleware, the this keyword will point towards the query
toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

//aggregation middleware, the this keyword point towards the aggregate object
// toursSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

// query middleware, responsible to populate the guide fields with referece user inforamtion.
toursSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
  next();
});

toursSchema.post(/^find/, function (docs, next) {
  console.log(Date.now() - this.start);
  next();
});

//here we are creating a modal from the toursSchema
const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;

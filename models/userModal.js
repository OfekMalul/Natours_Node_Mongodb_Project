const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'A password must be at least 8 characters long'],
    select: false, //the password cannot be retrived from the db
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please renter your password'],
    validate: {
      // Only works on save and create
      validator: function (el) {
        return el === this.password;
      },
      message: 'Incorrect password',
    },
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//document middleware, runs before the save() and create() method
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; // we just need this field to check the password but we dont want to presist it into the database
  }
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 10000; //ensures that the token created after the passwordChangeAt
  next();
});
// this middleware will triger for every query that will start with find (ex' findByIdAndUpdate)
userSchema.pre(/^find/, function (next) {
  // the this keyword points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// this is an instance method - meaning the method will be available for all documents within the collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // the compare method allows us to comapre between the already encrypted user passwrod and the unencrypred user password
  return await bcrypt.compare(candidatePassword, userPassword);
};

//checks if the user changed the password
userSchema.methods.passwordChanged = function (JWTTimeStamp) {
  if (this.passwordChangeAt) {
    const changedPasswordTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    return changedPasswordTimeStamp > JWTTimeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  //encrypting the token to reduce vourlanbility from possible attacks
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //expires in 10 minutes
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

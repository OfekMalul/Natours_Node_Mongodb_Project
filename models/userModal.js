const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
      validator: function () {
        return this.password === this.passwordConfirm;
      },
      message: 'Incorrect password',
    },
  },
});

//document middleware, runs before the save() and create() method
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    //bcrypt algorithem to encrypt data (hashing data)
    // bcrypt will add a random string to the password so two eqaul passwords wont generate the same hash
    // bcrypt is great for brute force attacks
    // we want to pass the password that we want to hash and the cpu cost. The default cpu cost is 10.
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; // we just need this field to check the password but we dont want to presist it into the database
  }
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

const User = mongoose.model('User', userSchema);
module.exports = User;

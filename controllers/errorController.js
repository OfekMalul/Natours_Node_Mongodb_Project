const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `The field ${err.path} has an invalid value: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please provide a different name`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  //transforms the errors object to an array
  const errors = Object.values(err.errors);
  const message = errors.map((err) => err.message).join('. ');
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token! Please log in again!', 401);
};

const handleExpiredError = () => {
  return new AppError(`Your token expired, please log in again!`, 401);
};

const sendErrorDev = (err, req, res) => {
  // A) this is for api
  if (req.originalUrl.startsWith('/api')) {
    // we are returning as we want to make sure that the req res cycle ends after the error handeling.
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }
  // B) this is for rendered website
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) This if for api
  if (req.originalUrl.startsWith('/api')) {
    // operational error
    if (err.isOperational) {
      // we are returning as we want to make sure that the req res cycle ends after the error handeling.
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // programming or unkonwn error
    console.error(`Error! ` + JSON.stringify(err));
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }

  // B) This is for rendered website
  // operational error
  console.log(err.message);
  if (err.isOperational) {
    console.log(err);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  } else {
    // programming or unkonwn error
    console.error(`Error! ` + JSON.stringify(err));
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later.',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // we dont always want to provide all the errors, hence we are differeing it according to production or development
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // making a hard copy of the err
    let error = { ...err };
    error.message = err.message;
    // we are getting the name, code from MongoDB errors
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleExpiredError();
    sendErrorProd(error, req, res);
  }
};

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

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  // operational error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // programming or unkonwn error
  } else {
    console.error(`Error! ${err}`);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // we dont always want to provide all the errors, hence we are differeing it according to production or development
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // making a hard copy of the err
    let error = { ...err };
    // we are getting the name, code from MongoDB errors
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  }
};

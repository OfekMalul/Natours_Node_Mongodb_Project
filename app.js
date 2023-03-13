const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorMiddleware = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//1) middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));
app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// //3) Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
//handels an unused url requests
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.url} on this server!`, 404));
});

app.use(globalErrorMiddleware);

module.exports = app;

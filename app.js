const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorMiddleware = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//1) global middlewares
//Set Security HTTP headers
app.use(helmet());

// Development logins
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// dealing with broute force attacks and DOS
const limiter = rateLimit({
  max: 100, // max amout of requests
  windowMs: 60 * 60 * 1000, // a window of an hour in which no more than 100 requests can occur
  message: 'Too many requests from this IP please try again in an hour.',
});

app.use('/api', limiter);
// Reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
//parsing the data from the cookie
app.use(cookieParser());

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Data sanatization against noSQL query injections
app.use(mongoSanitize());

// Data sanatization for cross side scripting attacks (XSS)
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(function (req, res, next) {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://cdnjs.cloudflare.com"
  );
  next();
});

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// //3) Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
//handels an unused url requests
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.url} on this server!`, 404));
});

app.use(globalErrorMiddleware);

module.exports = app;

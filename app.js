const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSenetize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // responsible for routes/pages I render

//1) GLOBAL MIDDLEWARES

    // Serving static files
app.use(express.static(path.join(__dirname, 'public')));

    //Set security HTTP headers
//app.use(helmet()); 
//app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' })); //npm i helmet@3.23.3
app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      // ...
    })
  );
    // Development logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

    // Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,//time for expiration 1 hr
    message: 'Too many requests from this IP, please try again in an hour'
});
    // working in all routes
app.use('/api',limiter);

    // Body paser, reading data from the body into req.body
app.use(express.json({ limit: '10kb'}));

    //Data sanitization against NoSQL query injection
    // prevents from input attacks "email": {"$gt": ""},
    //always put after json middleware because its responsible for body parser
app.use(mongoSenetize());

    // Data sanitization against XSS
    // cleans any special charactor(s) from html inputs to stop user attacks
app.use(xss());

    // Prevents parameter population
app.use(
    hpp({
        whitelist: ['duration','ratingsQuanity','ratingsAvarage',
              'difficulty','price','maxGroupSize']
}));

    // Test middleware
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next();
})

//Routes

app.use('/', viewRouter);
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);

//rout to handle a route thst does not exist
//[all] means all methodes, get,post,put,delete
app.all('*', (req,res, next)=>{
    next(new AppError(`Can't find this route ${req.originalUrl} on this server`,404));
})

app.use(globalErrorHandler);
module.exports = app;
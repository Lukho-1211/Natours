const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express();

console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`))

app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next();
})

//Routes
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);

//rout to handle a route thst does not exist
//[all] means all methodes, get,post,put,delete
app.all('*', (req,res, next)=>{
    next(new AppError(`Can't find this route ${req.originalUrl} on this server`,404));
})

app.use(globalErrorHandler);
module.exports = app;
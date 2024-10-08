const AppError = require('./../utils/appError');

const handleCastErrorDB = err=>{
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err =>{
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
}
const handleValidationDB = err=>{
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, res)=>{
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}


const sendErrorProd = (err,res)=>{
    //Operational, trusted error: send message to client
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    //Programming to other unkwown eorr: don't leak details
    }else{
        console.error('Error :', err);

        res.status(500).json({
            status: 'fail',
            message: 'Something went very wrong'
        })
    }
    
}

module.exports=(err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'failed';

    if(process.env.NODE_ENV === 'development'){
       sendErrorDev(err,res);
    }else if(process.env.NODE_ENV === 'production'){
        let error = {...err};

        if(error.name === 'castError') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name === 'ValidationError') error = handleValidationDB(error);
        sendErrorProd(error,res);
    }
   
}
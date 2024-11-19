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

const sendErrorDev = (err, req, res)=>{
    // A) API
    if(req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });     
    }

    // B) Rendered website
    console.error('Error :', err);

    return res.status(err.statusCode).render('error',{
        title: 'Something went wrong.!',
        msg: err.message
    })
    
}


const sendErrorProd = (err, req, res)=>{
    //A) API
    if(req.originalUrl.startsWith('/api')){
        //Operational, trusted error: send message to client
        if(err.isOperational){
           return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        //Programming to other unkwown eorr: don't leak details
        }
            console.error('Error :', err);
            // send a generic message 
            return res.status(500).json({
                status: 'fail',
                message: 'Something went very wrong'
            })
        
    } 
    //B) RENDERED WEBSITE
    if(err.isOperational){
        return res.status(err.statusCode).render('error',{
            title: 'Something went wrong.!',
            msg: err.message
        })
    //Programming to other unkwown eorr: don't leak details
    }

    console.error('Error :', err);

    return res.status(err.statusCode).render('error',{
        title: 'Please try again later.'
    })   
    
}

module.exports=(err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'failed';

    if(process.env.NODE_ENV === 'development'){
       sendErrorDev(err, req, res);
    }else if(process.env.NODE_ENV === 'production'){
        let error = {...err};
        error.message = err.message;

        if(error.name === 'castError') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name === 'ValidationError') error = handleValidationDB(error);
        sendErrorProd(error, req, res);
    }
   
}
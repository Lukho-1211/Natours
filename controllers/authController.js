const { promisify } = require('util');// for promises 
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { decode } = require('punycode');

const signToken = id =>{
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.signup = catchAsync(async (req,res, next)=>{
    //const newUser = await User.create(req.body);Wrong way of signing up
    const newUser = await User.create({// Only allows the data input to be created
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });
// JSON web tokken are made up of 3 velues  [PAYLOAD] + [SECRET] + [EXPIRY DATE]         
    const token = signToken({id: newUser._id});

    res.status(201).json({
        status: 'success',
        token,
        data: {
            newUser
        }
    })
});

exports.login = catchAsync( async(req,res,next)=>{

//1) declare input valiables
    const {email, password} = req.body;

//2) check if they are empty
    if(!email || !password){                         // 400 bad request
        return next(new AppError('Please enter email or password', 400));
    }

//3) check if user exist password in the database
    const user = await User.findOne({email}).select('+password');
    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Incorrect email or password', 401));
    }
    const token = signToken(user._id);
//send token and user details to the users
    res.status(200).json({
            success: 'true',
            token
    });
});

exports.protect = catchAsync( async(req, res, next)=>{

//1) Get token and check if its there/exist
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
       token = req.headers.authorization.split(' ')[1];
    }

    if(!token){                                                              // 401 unAthorized
        return next(new AppError('You are not loged in! Please login to access this page', 401));
    }
//2) Verification token
// can also do a try catch here
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //console.log(decoded);
//3) Check if user exists in database
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError('The user belonging to thus token does no longer exists. Please log in', 401))
    }

//4) check if user changed password after the token was issused
   if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password! Please log in again', 401));
   }

   // Grant Access to the next protected route
   req.user = currentUser;
    next();
});

// This is how to right a middleware that accepts parameters
// the [...]roles means its an array
exports.restrictTo = (...roles)=>{
    return(req,res,next)=>{
        if(!roles.includes(req.user.role)){                                  //unAthorized 403
            return next(new AppError('You do not have permission to perform this action', 403))
        }
        next();
    };
};
const { promisify } = require('util');// for promises 
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const { text } = require('express');

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
        passwordConfirm: req.body.passwordConfirm
       // passwordChangedAt: req.body.passwordChangedAt,
        //role: req.body.role
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


exports.forgotPassword = catchAsync( async(req,res,next)=>{
    //1) Get user based on Posted email
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new AppError('There is no user with this email Address', 404));
    }

    //2) Generate the rondom reset token
    const resetToken = user.createPasswordResetToken(); 
    await user.save({ validateBeforeSave: false });
 
    //3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgort your password? Submit a PATCH request with your new password and 
                and confirm password to ${resetURL}\nIf you do did not forget password, please 
                forget ignore this email`;
    const subject = 'Your reset token (valid for 10 min)';
    try {
        await sendEmail({
            email: user.email,   // same as req.body.emails
            subject,
            message
        });

        res.status(200).json({
            status: 'success', 
            message: 'Token sent to email'
        });
        
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending the email. Try again later', 500));
    }
    
});


exports.resetPassword = catchAsync( async(req,res,next)=>{
    //1) Get the user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken,
                                passwordResetExpires: { $gt: Date.now() } });
    
    //2)If token has not expired, and there is a user, set new password
    if(!user){
        return next( new AppError('Token is invalid or has expired',400));
    }
   
    //3) Update ChangepasswordAt property for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    //4) Log the user in, Send JWT


    const token = signToken(user._id);
    //send token and user details to the users
        res.status(200).json({
                success: 'true',
                token
        });
});
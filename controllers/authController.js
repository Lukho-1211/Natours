const { promisify } = require('util');// for promises 
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const cookieParser = require('cookie-parser');



const signToken = id =>{
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

//send token and user details to the users
const sendCreateToken = (user, statusCode, res)=>{
    const token = signToken({id: user.id});
    const cookieOptions = {
        expires: new Date( //converts to mili seconds
            Date.now()+ process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
            ), 
        httpOnly: true
    };

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    // name of the cookie, value, options
    res.cookie('jwt', token, cookieOptions);

    //remove password from selection / from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}


exports.signup = catchAsync(async (req,res, next)=>{
    //const newUser = await User.create(req.body);Wrong way of signing up
    const newUser = await User.create({// Only allows the data input to be created
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
       // passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });
// JSON web tokken are made up of 3 velues  [PAYLOAD] + [SECRET] + [EXPIRY DATE]         
    sendCreateToken(newUser, 201, res);
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

    sendCreateToken(user, 200, res);
 
});

exports.logout = (req,res, next)=>{
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000), //set the cookie to expire in 10sec
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
}

exports.protect = catchAsync( async(req, res, next)=>{

//1) Get token and check if its there/exist
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
       token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies.jwt){
        token = req.cookies.jwt
    }

    if(!token){                                                              // 401 unAthorized
        return next(new AppError('You are not loged in! Please login to access this page', 401));
    }

//2) Verification token
// can also do a try catch here
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//3) Check if user exists in database
    const currentUser = await User.findById(decoded.id.id || decoded.id);
    if(!currentUser){
        return next(new AppError('The user belonging to thus token does no longer exists. Please log in', 401))
    }

//4) check if user changed password after the token was issused
   if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password! Please log in again', 401));
   }

   // Grant Access to the next protected route
   req.user = currentUser;
   res.locals.user = currentUser; // be aware its [res.locals] not req.locals
    next();
});


    // Only for rendered pages, no errors
exports.isLoggIn = async(req, res, next)=>{
    if(req.cookies.jwt){    
            try {
                    //1) Verification token    
                const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
            
                //2) Check if user exists in database
                const currentUser = await User.findById(decoded.id.id || decoded.id);
                if(!currentUser){
                    return next()
                }
                
                //3) check if user changed password after the token was issused
                if(currentUser.changedPasswordAfter(decoded.iat)){
                    return next();
                }
                
                // There is a loggin user
                //another way to send data to frontend
                req.user = currentUser;
                res.locals.user = currentUser; // be aware its [res.locals] not req.locals
                return next();
            } catch (error) {
                return next();
            }
        }
    next();
};

    
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
            email: user.email,   // same as req.body.email
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

    //send token and user details to the users
    sendCreateToken(user, 200, res);
});


exports.updatePassword = catchAsync( async(req,res,next)=>{
    //1) Get user from collection
    const Id = req.user.id;
    console.log(`updatMe works in authController`);
    const user = await User.findById(Id).select('+password');

    //2)check if current posted user is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your current password is incorrect',401));
    }
    //3) if so update current user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();//User.UpdateById will not work as intended

    //4) Log user in, send JWT
    sendCreateToken(user, 200, res);

});
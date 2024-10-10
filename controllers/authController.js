const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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
    });
// JSON web tokken are made up of 3 velues  [PAYLOAD] + [SECRET] + [EXPIRY DATE]         
    const token = signToken({id: newUser._id});

    res.status(201).json({
        status: 'success',
        token
    })
});

exports.login = catchAsync( async(req,res,next)=>{

//1) declare input valiables
    const {email, password} = req.body;

//2) check if they are empty
    if(!email || !password){
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
        }
    )
});
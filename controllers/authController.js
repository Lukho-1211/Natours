const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');


exports.signup = catchAsync(async (req,res, next)=>{
    //const newUser = await User.create(req.body);Wrong way of signing up
    const newUser = await User.create({// Only allows the data input to be created
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
// JSON web tokken are made up of 3 velues  [PAYLOAD] + [SECRET] + [EXPIRY DATE]         
    const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
});
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
//const AppError = require('./../utils/appError');
 

exports.getAllUser = catchAsync( async(req,res)=>{
    const user = await User.find();
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

exports.createUser = (req,res)=>{
    res.status(500).json({
        status: 'failed',
        data: 'Method not implimented'
    });
}
exports.getUser = (req,res)=>{
    res.status(500).json({
        status: 'failed',
        data: 'Method not implimented'
    });
}
exports.updateUser = (req,res)=>{
    res.status(500).json({
        status: 'failed',
        data: 'Method not implimented'
    });
}
exports.deleteUser = (req,res)=>{
    res.status(500).json({
        status: 'failed',
        data: 'Method not implimented'
    });
}


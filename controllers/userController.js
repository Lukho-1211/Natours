const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
 
const filterObj = (obj, ...allowedFields) =>{
    const newObj = {};
    Object.keys(obj).forEach( el=>{
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}


exports.getAllUser = catchAsync( async(req,res)=>{
    const user = await User.find();
    res.status(200).json({
        status: 'success',
        results: user.length,
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

exports.UpdateMe = catchAsync( async(req,res,next)=>{
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This rout is not for password update. Please use /update Password', 400));
    }

    //2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    //const {name, email} = req.body; [allow work]
 
    //3) Update user document
    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, 
        {
            new: true,//to return the updated object instead of the old one
            runValidators: true
        });

    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    });
})

exports.deleteMe = catchAsync( async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: 'success',
        data: {
            user: null
        }
    });
})
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('../controllers/handlerfactory');

 
const filterObj = (obj, ...allowedFields) =>{
    const newObj = {};
    Object.keys(obj).forEach( el=>{
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}


// exports.getAllUser = catchAsync( async(req,res)=>{
//     const user = await User.find();
//     res.status(200).json({
//         status: 'success',
//         results: user.length,
//         data: {
//             user
//         }
//     });
// });

exports.createUser = (req,res)=>{
    res.status(500).json({
        status: 'failed',
        data: 'Method not implimented/ please use sigup instead'
    });
}




exports.UpdateMe = catchAsync( async(req,res,next)=>{
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password update. Please use /update Password', 400));
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

exports.getAllUser = factory.getAll(User);
exports.getUser = factory.getOne(User);

    // Do Not update password with this!!!!
exports.updateUser = factory.UpdateOne(User);

exports.deleteUser = factory.deleteOne(User);
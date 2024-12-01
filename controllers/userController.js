const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('../controllers/handlerfactory');


//    // configuring multer for destination & name of the file
// const multerStorage = multer.diskStorage({
//     destination: (req,file, cb)=>{// cb means callback [just like next for multer]
//         // first aurgument is for error. second is for data
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb)=>{
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb)=>{ // check to accept only images
    if(file.mimetype.startsWith('image')){
        cb(null, true);
    }else{
        cb(new AppError('Not an image! Please upload only images',400), false);
    }
}

const upload = multer({ // actual uploads method
    storage: multerStorage, 
    fileFilter: multerFilter // checks if its an image
});

exports.uploadUserPhoto = upload.single('photo'); // 'photo' is the fieled name from the form


exports.resizeUserPhoto = ( req, res, next)=>{
    if(!req.file)return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    sharp(req.file.buffer)
        .resize(500,500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();

}

const filterObj = (obj, ...allowedFields) =>{
    const newObj = {};
    Object.keys(obj).forEach( el=>{
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}



exports.getMe = (req,res, next)=>{
    req.params.id = req.user.id;
    next();
}

 
exports.UpdateMe = catchAsync( async(req,res,next)=>{
    // console.log(req.file);
    // console.log(req.body);
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password update. Please use /update Password', 400));
    }
 
    //2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    //const {name, email} = req.body; [allow work]

    if(req.file) filteredBody.photo = req.file.filename; // add photo on the req.body 
 
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
    console.log('this is id');
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
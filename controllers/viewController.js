const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync( async(req, res, next)=>{
    //1) Get tour data from collection
    const tours = await Tour.find();

    //2) Build template

    //3) Render that template with tour data from 1)
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    });
});

exports.getTour = (req, res)=>{
    res.status(200).render('tour',{
        title: 'The Forest Hicker'
    });
};

exports.getTourDetail = catchAsync( async(req,res, next)=>{
    const tourName = req.params.slug;
    const tour = await Tour.findOne({slug:tourName}).populate({
        path: 'reviews',
        fields: 'review rating user'
    })
    //console.log(tour.guides);

    if(!tour){
        return next(new AppError('There is no tour with that name',404));
    }
    res.status(200).render('tour',{
        title: `${tour.name} Tour`,
        tour
    })
})


exports.getLoginForm = (req,res)=>{

    res
    .status(200)
    .set(
        'Content-Security-Policy',
        "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('login', {
        title: 'Log into your account',
    });

}

exports.getAccount= (req, res)=>{
    res
    .status(200)
    .set(
        'Content-Security-Policy',
        "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('account', {
        title: 'Your Accout Details',
    });
}

exports.updateUserData = catchAsync( async(req, res, next)=>{
    console.log(req.user.id);
    const updateUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    },
    {
        new: true,
        runValidators: true
    });

    res
    .status(200)
    .render('account', {
        title: 'Your Accout Details',
        user: updateUser
    });

    

})
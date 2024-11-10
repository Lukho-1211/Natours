const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');

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

exports.getTourDetail = catchAsync( async(req,res)=>{
    const tourName = req.params.slug;
    const tour = await Tour.findOne({slug:tourName}).populate({
        path: 'reviews',
        fields: 'review rating user'
    })
    //console.log(tour.guides);

    const user = User.findOne();

    res.status(200).render('tour',{
        title: `${tour.name} Tour`,
        tour
    })
})
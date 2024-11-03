const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
//const AppError = require('./../utils/appError');
const factory = require('./handlerfactory');
 
exports.aliasTopTours = (req,res,next)=>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAvarage,-price';
    req.query.fields = 'name,price,ratingsAvarage,summary,difficulty';
    next();
}

exports.getAllTours = factory.getAll(Tour);


// exports.getTour = catchAsync(async (req,res, next)=>{
//         const tour = await Tour.findById(req.params.id).populate('reviews');
// // [Alternitive way] const tour = await Tour.findOne({__id: req.params.id});

//         if(!tour){
//             return next(new AppError('No tour found with this Id', 404));
//         }
//         res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     });
// })







exports.getTourStats = catchAsync(async (req,res) => {
    const stats = await Tour.aggregate([
        {//match is used to select documents
            $match: { ratingsAvarage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty'},
                numTours: {$sum: 1},
                numRating: { $sum: '$ratingsQuanity' },
                avgRating: { $avg: '$ratingsAvarage' },
                avgPrice: { $avg: '$price'},
                minPrice: { $min: '$price'},
                maxPrice: { $max: '$price'}
            }
        },
        {
            $sort: { avgPrice: 1 } 
        },
        // {
        //     $match: { _id: { $ne: 'EASY'}}
        // }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
})


exports.getMonthlyPlan = catchAsync(async(req,res) =>{
    const year = req.params.year *1;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match:{
                startDates:{
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group:{
                _id: { $month: '$startDates'},
                numTourStarts: { $sum: 1},
                tours: { $push: '$name'}
            }
        },
        {
            $addFields: { month: '$_id'}
        },
        {
            $project: {// this show or hides fields
                _id : 0 //zero hides  one shows
            }
        },
        {
            $sort:{ numTourStarts: -1}//Desending || higest number
        },
        {
            $limit: 12
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });        
});

exports.getTour = factory.getOne(Tour, {path: 'reviews'});
exports.creatTour = factory.createOne(Tour);
exports.UpdateTour = factory.UpdateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

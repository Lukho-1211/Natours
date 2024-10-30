const Tour = require('./../models/tourModel');
const APIFeactures = require('./../utils/apiFeactures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
 
exports.aliasTopTours = (req,res,next)=>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAvarage,-price';
    req.query.fields = 'name,price,ratingsAvarage,summary,difficulty';
    next();
}

exports.getAllTours = catchAsync(async(req,res)=>{
    const feactures = new APIFeactures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();
    
    // EXECUTE QUERY
    const tours = await feactures.query;

        res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            tours: tours
        }
    });
})


exports.getTour = catchAsync(async (req,res, next)=>{
        const tour = await Tour.findById(req.params.id);//.populate({path: 'guides', select: '-__v'});
        //const tour = await Tour.findOne({__id: req.params.id});

        if(!tour){
            return next(new AppError('No tour found with this Id', 404));
        }
        res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
})



exports.creatTour = catchAsync(async (req,res)=>{
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            tour: newTour
        }
    });  
}); 



exports.UpdateTour = catchAsync(async(req,res,next)=>{
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,
        {
          new: true,
          runValidators: false// using validations from mangoose Model
        });
    
    if(!tour){
        return next(new AppError('No tour found with this Id', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
})

exports.deleteTour = catchAsync(async (req,res,next)=>{
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if(!tour){
        return next(new AppError('No tour found with this Id', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
})

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
})
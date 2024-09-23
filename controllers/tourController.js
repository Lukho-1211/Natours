const { query } = require('express');
const Tour = require('./../models/tourModel');
const APIFeactures = require('./../utils/apiFeactures');
 
exports.aliasTopTours = (req,res,next)=>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAvarage,-price';
    req.query.fields = 'name,price,ratingsAvarage,summary,difficulty';
    next();
}

exports.getAllTours = async(req,res)=>{
    try {
        const feactures = new APIFeactures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .pagination();
        const tours = await feactures.query;

        // EXECUTE QUERY
        res.status(200).json({
            status: 'success',
            result: tours.length,
            data: {
                tours: tours
            }
        });
    } catch (err) {
        res.status(404).json({
            success: 'false',
            message: err
        })
    }
}


exports.getTour = async(req,res)=>{
    try {
        const tour = await Tour.findById(req.params.id);
        //const tour = await Tour.findOne({__id: req.params.id});
        res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            message: "Could not get a tour"
        })
    }
}

exports.creatTour = async(req,res)=>{
    try{
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        });  
    }catch(err){
        res.status(400).json({
            status: 'failed',
            message: err
        })
    }

}



exports.UpdateTour = async(req,res)=>{
   try{
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,
        {
          new: true,
          runValidators: true// using validations from mangoose Model
        });
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
   }catch(err){
    res.status(404).json({
        status: 'failed',
        message: err
    });
   }
}

exports.deleteTour = async (req,res)=>{
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            message: err
        });
    }
}

exports.getTourStats = async (req,res) => {
    try {
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
        
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            message: err
        });
    }
}


exports.getMonthlyPlan = async(req,res) =>{
    try {
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
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            message: err
        });
    }
}
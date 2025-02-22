const multer = require('multer');
const sharp = require('sharp');
const stripe = require('stripe')(process.env.STRIPE_SECRETE);
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerfactory');
 

exports.getTourPayment = catchAsync( async (req, res, next)=>{
    //1) get a tour
    const tour = await Tour.findById(req.params.tourId);
    
    //2) create session
    const session= stripe.checkout.session.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: {
            email: `${tour.email} Tour`,
            description: tour.summary,
            image: [`../public/img/tourstour-1-1.jpg`],
            amount: tour.price * 100,
            currency: 'usd',
            quantity: 1
        }
    });

    //3) send session response
    res.status(200).json({ 
        status: 'success',
        session
    })
});

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

 //upload.single('image'), |req.file| to upload one image
 //upload.array('images', 5); |req.files| to upload 5 images

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 }, // "imageCover" is same as database
    { name: 'images', maxCount: 3 } // "images" is same as database
]);

exports.resizeTourImages = catchAsync( async(req, res, next)=>{
    if(!req.files.imageCover || !req.files.images) return next();

    //1) CoverImage
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
            .resize(2000,1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${req.body.imageCover}`);

    //2) images
    req.body.images = [];

    await Promise.all(
        req.files.images.map( async(file, i) =>{
            const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

            await sharp(file.buffer)
                .resize(2000,1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);
        
            req.body.images.push(filename);
        })
    );
    next();
});


exports.aliasTopTours = (req,res,next)=>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAvarage,-price';
    req.query.fields = 'name,price,ratingsAvarage,summary,difficulty';
    next();
}

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


// /tours-within/:distance/center/:lnglat/unite/:unite'
exports.distanceWithin = catchAsync( async(req, res, next)=>{
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    //checkes if unit is in     miles     or  kilomiters
    const radius = unit==='mi'? distance/3963.2 : distance/6378.1;
    console.log(radius);
    if(!lng || !lat){
        next(new AppError('Please enter longitute and latitude', 400));
    }


    const tour = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng,lat], radius] }}
    });

    res.status(200).json({
        status: 'success',
        result: tour.length,
        data:{
            tour
        }
    })
});

exports.getDistance = catchAsync( async(req, res, next)=>{
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

        // if unit is miles to kilmiter
    const multiplier = unit==='mi' ? 0.000621371 : 0.001;  
    if(!lng || !lat){
        next(new AppError('Please enter longitute and latitude', 400));
    }

    // always use aggregation pipeline for calculations
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance', //this field will be created to store calculated distance
                distanceMultiplier: multiplier // divide by this variable
            }
        },
        {
            $project: { // helps to show only these following fields
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data:{
            distances
        }
    })
})




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


exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {path: 'reviews'});
exports.creatTour = factory.createOne(Tour);
exports.UpdateTour = factory.UpdateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

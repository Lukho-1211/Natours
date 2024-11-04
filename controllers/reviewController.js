const Review = require('../models/reviewModel');
const factory = require('../controllers/handlerfactory');
//const catchAsync = require('./../utils/catchAsync');

const sendRespose = (status, res, reviews)=>{
    res.status(status).json({
        status: 'success',
        results: reviews.length,
        data:{
            reviews
        }
    })
}

// exports.getAllReviews = catchAsync( async(req,res, next)=>{
//     let filter={};
//     if(req.params.tourId) filter= {tour: req.params.tourId}
//     const reviews = await Review.find(filter);
//     if(!reviews){
//         return(next(new AppError('No reviews:',400)));
//     }
//     sendRespose(200, res, reviews);
// })



// exports.creatReviews = catchAsync( async(req, res, next)=>{
//     //Allows nested routes
// if(!req.body.tour) req.body.tour = req.params.tourId;
// if(!req.body.user) req.body.user = req.user.id;
//     const createReview = await Review.create(req.body) 
//     sendRespose(201,res, createReview);

//     // try {
//     //     //const { review, rating } = req.Body
        
//     // } catch (error) {
//     //     res.status(400).json({
//     //         statuse: 'fail',
//     //         mssg: `something went wrong: ${error}`
//     //     })
//     // }
// })


//[
exports.setToursUserId = (req, res, next)=>{
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;

    next();
}
exports.creatReviews = factory.createOne(Review);
//]

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.UpdateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
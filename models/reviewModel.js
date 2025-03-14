const mongoose = require('mongoose');
const Tour = require('./tourModel');
//const User = require('./userModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour:{
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Reviews must belong to a tour.']
    },
    user:{
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'User must belong to a tour.']
    }
},
{
    toJSON: { virtuals: true},//when out put as json
    toObject: { virtuals: true}//when out put as object
});

reviewSchema.index({ tour:1, user:1}, {unique: true});

    // this code helps to show the table-row with the same tour and user ID
reviewSchema.pre(/^find/, function(next){
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // });

    this.populate({
        path: 'user',
        select: 'name photo'
    });
    
    next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId){
    const stats = await this.aggregate([
        {
            $match: { tour: tourId} 
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating'}
            }
        }
    ]);
    console.log(stats);
    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuanity: stats[0].nRating,
            ratingsAvarage: stats[0].avgRating
        })
    }else{
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuanity: 0,
            ratingsAvarage: 4.5
        })    
    }
};

reviewSchema.post('save', function(){
    this.constructor.calcAverageRatings(this.tour);
})

//this code executes before deleting or updating doc
    //findByIdAndUpdate also uses findOneAndDate under the scans
    //findByIdAndDelete also uses findOneAndDelete under the scans
reviewSchema.pre(/^findOneAnd/, async function(next){
   // this.r = await this.findOne();
    this.r = await this.clone().findOne();
    //console.log(this.r);
    next();
})

//this code executes after deleting or updating doc
    //findByIdAndUpdate also uses findOneAndDate under the scans
    //findByIdAndDelete also uses findOneAndDelete under the scans
    reviewSchema.post(/^findOneAnd/, async function(){
    //  await this.findOne(); does not work here, query has already exceduted 
        await this.r.constructor.calcAverageRatings(this.r.tour)
    })
    

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
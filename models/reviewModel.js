const mongoose = require('mongoose');
//const Tour = require('./tourModel');
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
})

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
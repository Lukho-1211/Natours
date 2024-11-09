const mongoose = require('mongoose');
const slugify = require('slugify'); // Helps in taking Strings from url
const validator = require('validator');
//const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour must have <= then 40 characters'],
        minlength: [10, 'A tour must have >= then 10 characters'],
       // validate: [validator.isAlpha, 'Tour name must be only contain characters']
    },
    slug: String,// this veriable is created by [pre] middleware
    duration:{
        type: Number,
        required: [true, ' A tour must have a duration']
    },
    maxGroupSize:{
        type: Number,
        required: [true, ' A tour must have a group size']
    },
    difficulty:{
        type: String,
        required: [true,' A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty must either: easy, medium, difficult'
        }
    },
    ratingsAvarage: {
        type: Number,
        default: 4.5,
        min: [1, ' Ratings must be above 1.0'],
        max: [5, ' Ratings must be below 5.0'],
        set: val=> Math.round(val * 10)/10 // 4.66667  4.7
    },
    ratingsQuanity:{
        type: Number,
        default:0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price.']
    },
    priceDescount: {
        type: Number,
        validate: {
            // [this] only point so the current doc on NEW creation creation
            validator: function(val){//val is the discount VALUE
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below price'
        }
    },
    summary:{
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    discription:{
        type: String,
        trim: true
    },
    imageCover:{
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour:{
        type: Boolean,
        default: false
    },
    startLocation: {
        type:{
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        description: String,
        day: Number
    },
    locations: [
        {
        type:{
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        description: String,
        day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},
{
    toJSON: { virtuals: true},//when out put as json
    toObject: { virtuals: true}//when out put as object
});


    // Indexing helps with the performance of the database
    // Helps not to visit all the doc everytime the query is done
tourSchema.index({price: 1, ratingsAvarage: -1});
tourSchema.index({slug: 1});
tourSchema.index({ startLocation: '2dsphere'});

        //VIRTUAL MIDDLEWARE
//this method can also be implimented in controller, but not best practise
//do not work eg (Tours.find({durationWeeks: 1}))
tourSchema.virtual('durationWeeks').get(function(){//this function can only
                                                    //work on GET method
    return this.duration / 7; // [this.] means this document
})

tourSchema.virtual('reviews',{
    ref: 'Review', //referance to the model/document 
    foreignField: 'tour', //where the Id is
    localField: '_id' //curent do with the date id to foreignFlield
})

        //DOCUMENT MIDDLEWARE:
// DOCUMENT MIDDLEWARE: runs BEFORE .save() and create() is triggered
tourSchema.pre('save', function(next){
    //console.log(this);
    this.slug = slugify(this.name, {lower: true});
    next();
});

    // How to embard Users collection to Tour collection
    // database must have || guide: Array || to work
    // This will before save run and hold the ID's from the User collection   
    
// tourSchema.pre('save', async function(next){
//     const guidePromisies = this.guide.map( async id => await User.findById(id));
//     this.guide = await Promise.all(guidePromisies);
//     next();
// })

// document middleware: runs AFTER .save() and create() is triggered
// doc parameter means the current document
// tourSchema.post('save', function(doc,next){
//     console.log(doc);
//     next();
// })

    
        //QUERY MIDDLEWARE
//tourSchema.pre('find', function(next){ run only to find query
tourSchema.pre(/^find/, function(next){// run [all] findby...
    this.find({secretTour: { $ne: true}});

    this.start = Date.now();
    next();
});

    // this code helps to show the table-row with the same guides ID
tourSchema.pre(/^find/, function(next){// run [all] findby...
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
})

tourSchema.post(/^find/, function(docs, next){
    console.log(`Run for ${Date.now() - this.start} millisecons`);
    next();
})


        //AGGRIGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next){
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true}}});
//     console.log(this.pipeline());
//     next();
// })


const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;



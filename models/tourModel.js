const mongoose = require('mongoose');
const slugify = require('slugify'); // Helps in taking Strings from url
const validator = require('validator');

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
        max: [5, ' Ratings must be below 5.0']
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
        required: [true, 'A tour must have a description']
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
    }
},{
    toJSON: { virtuals: true},//when out put as json
    toObject: { virtuals: true}//when out put as object
});

        //VIRTUAL MIDDLEWARE
//this method can also be implimented in controller, but not best practise
//do not work eg (Tours.find({durationWeeks: 1}))
tourSchema.virtual('durationWeeks').get(function(){//this function can only
                                                    //work on GET method
    return this.duration / 7; // [this.] means this document
})


        //DOCUMENT MIDDLEWARE:
// DOCUMENT MIDDLEWARE: runs BEFORE .save() and create() is triggered
tourSchema.pre('save', function(next){
    //console.log(this);
    this.slug = slugify(this.name, {lower: true});
    next();
});

// tourSchema.pre('save', function(next){
//     console.log('Will save document...');
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
})

tourSchema.post(/^find/, function(docs, next){
    console.log(`Run for ${Date.now() - this.start} millisecons`);
    next();
})


        //AGGRIGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next){
    this.pipeline().unshift({ $match: { secretTour: { $ne: true}}});
    console.log(this.pipeline());
    next();
})


const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;



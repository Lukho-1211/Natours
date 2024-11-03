const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeactures = require('./../utils/apiFeactures');

exports.deleteOne = Model => catchAsync(async (req,res,next)=>{
    const doc = await Model.findByIdAndDelete(req.params.id);
    if(!doc){
        return next(new AppError('No document found with this Id', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});


exports.UpdateOne = Model => catchAsync(async(req,res,next)=>{
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body,
        {
          new: true,
          runValidators: false// using validations from mangoose Model
        });
    
    if(!doc){
        return next(new AppError('No document found with this Id', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.createOne = Model => catchAsync(async (req,res)=>{
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            data: doc
        }
    });  
}); 

exports.getOne = (Model, popOption) => catchAsync(async (req,res, next)=>{
    let query =  Model.findById(req.params.id);

    if(popOption) query = query.populate(popOption);

    const doc = await query;
        if(!doc){
            return next(new AppError('No document found with this Id', 404));
        }
        res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.getAll = Model => catchAsync(async(req,res)=>{
     let filter={};
     if(req.params.tourId) filter= {tour: req.params.tourId}
    const feactures = new APIFeactures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();
    
    // EXECUTE QUERY
    const doc = await feactures.query;

        res.status(200).json({
        status: 'success',
        result: doc.length,
        data: {
            data: doc
        }
    });
})
const Tour = require('./../models/tourModel');
 

exports.getAllTours = async(req,res)=>{
    try {
        console.log(req.query);

        // BUILD QUERY
        // 1A) Filtering
        const queryObj = { ...req.query};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el=> delete queryObj[el]);

        //1B) Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match=> `$${match}`);
        //console.log(JSON.parse(queryStr));
        
        let query = Tour.find(JSON.parse(queryStr));
        // 2) Sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }else{
            query = query.sort('-createdAt');
        }
        
        // 3) Feild limiting
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        }else{
            query = query.select('-__v');
        }
        // const query = Tour.find()
        //     .where('duration')
        //     .equals(5)
        //     .where('difficulty')
        //     .equals('easy');

        const tours = await query;

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


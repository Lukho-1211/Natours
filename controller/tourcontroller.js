const fs = require('fs');
 
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val)=>{
    console.log(`Tour id is: ${val}`);

    if(req.params.id > tours.length){
        // if(!tour){
            return res.status(404).json({
                success: 'fail',
                data: "Invalid id entered",
            })
        }
    next();
}

exports.checkBody = (req, res, next) =>{
    if(!req.body.name || !req.body.price){
        return res.status(400).json({
            status: 'falied',
            error: 'Please provide name or price',
        })
    }
    next();
}


exports.getAllTour = (req,res)=>{
    console.log(req.requestTime);
    res.status(200).json({
        status: 'success',
        requestAt: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    });
}

exports.creatTour = (req,res)=>{
    //console.log(req.body);
    const newId = tours[tours.length -1].id +1;
    const newTour = Object.assign({id:newId}, req.body);

    tours.push(newTour);
    fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`,JSON.stringify(tours),err=>{
        res.status(201).json({
            status: "success",
            data: {
                tours: newTour
            }
        });
    });
}


exports.getTour = (req,res)=>{
    console.log(req.params);

    const id = req.params.id * 1;
    const tour = tours.find(el => el.id === id);


    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
}

exports.UpdateTour = (req,res)=>{
    console.log(req.params);

    const id = req.params.id * 1;
    const tour = tours.find(el => el.id === id);

    res.status(200).json({
        status: 'success',
        data: '<Updated Data'
    });
}

exports.deleteTour = (req,res)=>{
    console.log(req.params);

    const id = req.params.id * 1;
    const tour = tours.find(el => el.id === id);

    res.status(200).json({
        status: 'success',
        data: null,
    });
}


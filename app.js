const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

const port = 3000;

app.use(morgan('dev'));
app.use(express.json());

app.use((req,res,next)=>{
    console.log('Hello from the middleware');
    next();
})

app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next();
})

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTour = (req,res)=>{
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

const creatTour = (req,res)=>{
    //console.log(req.body);
    const newId = tours[tours.length -1].id +1;
    const newTour = Object.assign({id:newId}, req.body);

    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),err=>{
        res.status(201).json({
            status: "success",
            data: {
                tours: newTour
            }
        });
    });
}


const getTour = (req,res)=>{
    console.log(req.params);

    const id = req.params.id * 1;
    const tour = tours.find(el => el.id === id);

    if(id > tours.length){
    // if(!tour){
        return res.status(404).json({
            success: 'fail',
            data: "Invalid id entered",
        })
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
}

const UpdateTour = (req,res)=>{
    console.log(req.params);

    const id = req.params.id * 1;
    const tour = tours.find(el => el.id === id);

    if(id > tours.length){
    // if(!tour){
        return res.status(404).json({
            success: 'fail',
            data: "Invalid id entered",
        })
    }

    res.status(200).json({
        status: 'success',
        data: '<Updated Data'
    });
}

const deleteTour = (req,res)=>{
    console.log(req.params);

    const id = req.params.id * 1;
    const tour = tours.find(el => el.id === id);

    if(id > tours.length){
    // if(!tour){
        return res.status(204).json({
            success: 'success',
            data: "Invalid id entered",
        })
    }

    res.status(200).json({
        status: 'success',
        data: null,
    });
}

const getAllUser = (req,res)=>{
    res.status(500).json({
        status: 'failed',
        data: 'Method not implimented'
    });
}
const createUser = (req,res)=>{
    res.status(500).json({
        status: 'failed',
        data: 'Method not implimented'
    });
}
const getUser = (req,res)=>{
    res.status(500).json({
        status: 'failed',
        data: 'Method not implimented'
    });
}
const updateUser = (req,res)=>{
    res.status(500).json({
        status: 'failed',
        data: 'Method not implimented'
    });
}
const deleteUser = (req,res)=>{
    res.status(500).json({
        status: 'failed',
        data: 'Method not implimented'
    });
}

const tourRouter = express.Router()
const userRouter = express.Router()

tourRouter.route('/')
    .get(getAllTour)
    .post(creatTour);

tourRouter.route('/:id')
    .get(getTour)
    .patch(UpdateTour)
    .delete(deleteTour);

userRouter.route('/')
    .get(getAllUser)
    .post(createUser);

userRouter.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/user',userRouter);
    
app.listen(port, ()=>{
    console.log(`Connected to port ${port}`);
});
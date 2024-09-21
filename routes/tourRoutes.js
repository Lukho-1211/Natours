const express = require('express'); 
const tourController = require('./../controllers/tourController');

const tourRouter = express.Router();

tourRouter.route('/')
    .get(tourController.getAllTours)
    .post(tourController.creatTour);

tourRouter.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.UpdateTour)
    .delete(tourController.deleteTour);

module.exports = tourRouter;

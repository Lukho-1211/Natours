const express = require('express');
const tourController = require('../controller/tourcontroller');

const tourRouter = express.Router();

tourRouter.param('id',tourController.checkID);

tourRouter.route('/')
    .get(tourController.getAllTour)
    .post(tourController.checkBody, tourController.creatTour);

tourRouter.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.UpdateTour)
    .delete(tourController.deleteTour);

module.exports = tourRouter;

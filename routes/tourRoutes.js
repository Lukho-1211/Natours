const express = require('express'); 
const tourController = require('../controllers/tourController');

const tourRouter = express.Router();

tourRouter.route('/tour-stats')
    .get(tourController.getTourStats);

tourRouter.route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/montly-plan/:year')
    .get(tourController.getMonthlyPlan);

tourRouter.route('/')
    .get(tourController.getAllTours)
    .post(tourController.creatTour);

tourRouter.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.UpdateTour)
    .delete(tourController.deleteTour);

module.exports = tourRouter;

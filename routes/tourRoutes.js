const express = require('express'); 
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

const tourRouter = express.Router();

    //This is a nested route [taking the tourId by params]
    // tours/api/v1/766809/review then redirect to views/api/v1/ with tourId
tourRouter.use('/:tourId/review', reviewRouter);


tourRouter.route('/tour-stats')
    .get(tourController.getTourStats);

tourRouter.route('/top-5-cheap')
    .get(tourController.aliasTopTours
        , tourController.getAllTours);

tourRouter.route('/montly-plan/:year')
    .get(tourController.getMonthlyPlan);

tourRouter.route('/')
    .get(authController.protect ,tourController.getAllTours)
    .post(tourController.creatTour);

tourRouter.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.UpdateTour)
    .delete(authController.protect, 
            authController.restrictTo('admin', 'lead-guide'), 
            tourController.deleteTour);


module.exports = tourRouter;

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
    .get(authController.protect,
        authController.restrictTo('admin', 'lead-guide','guide'),
        tourController.getMonthlyPlan);

        // route for Geo special Query
tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit')
        .get(tourController.distanceWithin);

        // route use Geo spcial Aggrication
        //calculate distances of a tour from a certian point
tourRouter.route('/distances/:latlng/unit/:unit')
        .get(tourController.getDistance);


tourRouter.route('/')
    .get(tourController.getAllTours)
    .post(authController.protect,
          authController.restrictTo('admin', 'lead-guide'),
          tourController.creatTour);

tourRouter.route('/:id')
    .get(tourController.getTour)
    .patch(authController.protect,
          authController.restrictTo('admin', 'lead-guide'),
          tourController.UpdateTour)
    .delete(authController.protect, 
            authController.restrictTo('admin', 'lead-guide'), 
            tourController.deleteTour);


module.exports = tourRouter;

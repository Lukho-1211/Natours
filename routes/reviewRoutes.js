const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

                                    // For nested routes
const reviewRoutes = express.Router({mergeParams: true});

reviewRoutes.use(authController.protect);

    //getAllReviews can recieve tourId in params
reviewRoutes.route('/')
            .get(reviewController.getAllReviews)
            .post(authController.protect
                  ,authController.restrictTo('user')
                  ,reviewController.setToursUserId
                  ,reviewController.creatReviews);
 
reviewRoutes.route('/:id')
            .get(reviewController.getReview)
            .patch(authController.restrictTo('user', 'admin'),
             reviewController.updateReview)
            .delete(authController.restrictTo('user', 'admin'),
            reviewController.updateReview,
            reviewController.deleteReview);


module.exports = reviewRoutes;
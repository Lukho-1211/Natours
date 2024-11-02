const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const reviewRoutes = express.Router({mergeParams: true});


reviewRoutes.route('/')
            .get(reviewController.getAllReviews)
            .post(authController.protect
                  ,authController.restrictTo('user')
                  ,reviewController.creatReviews);




module.exports = reviewRoutes;
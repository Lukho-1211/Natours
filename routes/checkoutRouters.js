const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const viewRouter = express.Router();

viewRouter.get('/checkoutTour/:tourId',authController.protect, tourController.getTourPayment);



module.exports = viewRouter;

const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const viewRouter = express.Router();

viewRouter.get('/', viewController.getOverview);
viewRouter.get('/tour', viewController.getTour);
viewRouter.get('/tour/:slug',authController.protect, viewController.getTourDetail);
viewRouter.get('/login', viewController.getLoginForm);

module.exports = viewRouter;

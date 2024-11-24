const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const viewRouter = express.Router();

viewRouter.get('/login',authController.isLoggIn, viewController.getLoginForm);
viewRouter.get('/',authController.isLoggIn, viewController.getOverview);
//viewRouter.get('/tour', viewController.getTour);
viewRouter.get('/tour/:slug',authController.isLoggIn, viewController.getTourDetail);
viewRouter.get('/me', authController.protect, viewController.getAccount);

viewRouter.post('/submit-user-data',authController.protect, viewController.updateUserData);


module.exports = viewRouter;

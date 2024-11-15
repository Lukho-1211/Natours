const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const viewRouter = express.Router();

viewRouter.use(authController.isLoggIn);

viewRouter.get('/login', viewController.getLoginForm);
viewRouter.get('/', viewController.getOverview);
//viewRouter.get('/tour', viewController.getTour);
viewRouter.get('/tour/:slug', viewController.getTourDetail);


module.exports = viewRouter;

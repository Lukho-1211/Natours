const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

userRouter.post('/signin', authController.signup);
userRouter.post('/login', authController.login);
userRouter.get('/logout', authController.logout);
userRouter.post('/forgotPassword', authController.forgotPassword); 
userRouter.patch('/resetPassword/:token', authController.resetPassword);

// All routes after this are protect because of the middleware
userRouter.use(authController.protect);

userRouter.patch('/updatePassword',
                authController.updatePassword);
userRouter.get('/me',
                userController.getMe,
                userController.getUser);
userRouter.patch('/updateMe',
                   userController.uploadUserPhoto,
                   userController.resizeUserPhoto, 
                   userController.UpdateMe);
                   
userRouter.delete('/deleteMe', userController.deleteMe);


// Only admin are allowed to do all thw below functions
userRouter.use(authController.restrictTo('admin'));

userRouter.route('/')
    .get(userController.getAllUser);

userRouter.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = userRouter;

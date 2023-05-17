const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/verifyJWT');
const userController = require('../controllers/userController');
const {check} = require("express-validator");

router.post('/users/login', [
    check('user.email', 'Email is required').isEmail().normalizeEmail(),
    check('user.password', 'Password is required').isStrongPassword({minSymbols: 0}).withMessage('Password must be at least 8 characters long and contain at least one number and one letter')
], userController.userLogin);
router.post('/users', [
    check('user.email', 'Email is required').isEmail().normalizeEmail(),
    check('user.password', 'Password is required').isStrongPassword({minSymbols: 0}).withMessage('Password must be at least 8 characters long and contain at least one number and one letter')
], userController.registerUser);
router.get('/user', authMiddleware, userController.getCurrentUser);
router.put('/user', [
    check('user.email', 'Email is required').isEmail().normalizeEmail().optional(),
    check('user.password', 'Password is required').isStrongPassword({minSymbols: 0}).withMessage('Password must be at least 8 characters long and contain at least one number and one letter').optional(),
    check('user.username', 'Username is required').isLength({min: 3}).optional(),
    check('user.bio', 'Bio is required').isLength({min: 10}).optional(),
    check('user.image', 'Image is required').isURL({require_protocol: true}).optional(),
    authMiddleware,
], userController.updateUser);
router.delete('/user', authMiddleware, userController.deleteMe);

module.exports = router;
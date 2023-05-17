const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/verifyJWT');
const authMiddlewareOptional = require('../middleware/verifyJWTOptional');
const profileController = require('../controllers/profileController');

router.get('/:username', authMiddlewareOptional, profileController.getProfile);
router.post('/:username/follow', authMiddleware, profileController.followUser);
router.delete('/:username/follow', authMiddleware, profileController.unFollowUser);

module.exports = router;
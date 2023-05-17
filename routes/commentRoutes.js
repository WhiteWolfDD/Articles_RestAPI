const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/verifyJWT');
const commentController = require('../controllers/commentController');

router.post('/:slug/comments', authMiddleware, commentController.addCommentsToArticle);
router.get('/:slug/comments', commentController.getCommentsFromArticle);
router.delete('/:slug/comments/:id', authMiddleware, commentController.deleteComment);

module.exports = router;
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/verifyJWT');
const articleController = require('../controllers/articleController');

router.get('/feed', authMiddleware, articleController.feedArticles);
router.get('/', articleController.listArticles);
router.get('/:slug', articleController.getArticleWithSlug);
router.post('/', authMiddleware, articleController.createArticle);
router.delete('/:slug', authMiddleware, articleController.deleteArticle);
router.post('/:slug/favorite', authMiddleware, articleController.favoriteArticle);
router.delete('/:slug/favorite', authMiddleware, articleController.unfavoriteArticle);
router.put('/:slug', authMiddleware, articleController.updateArticle);

module.exports = router;
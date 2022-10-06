var express = require('express');
const { new_comment_post } = require('../controllers/commentController');
const { new_post_post, posts_get } = require('../controllers/postController');
const { user_create_post, user_signin_post, user_signout_post } = require('../controllers/userController');
var router = express.Router();

/* GET home page. */
router.get('/', posts_get);

/* GET account page. */
router.get('/sign-up', function(req, res, next) {
    res.render('sign-up', {sheet: 'sign-up', user: req.user});
  });

// POST for sign-up.
router.post('/sign-up', user_create_post);

// POST for sign-in.
router.post('/sign-in', user_signin_post);

/* GET sign-out request. */
router.get('/sign-out', user_signout_post);

// POST request for adding a new post/article.
router.post('/posts/new', new_post_post);

// POST request for adding a new comment 
router.post('/comments/new', new_comment_post);

module.exports = router;

var express = require('express');
const { new_comment_post, comment_like_post, comment_unlike_post } = require('../controllers/commentController');
const { new_post_post, posts_get, post_like_post, post_unlike_post } = require('../controllers/postController');
const { user_create_post, user_signin_post, user_signout_post, user_profile_get, friend_request_send_post, friend_request_accept_post, friend_remove_post } = require('../controllers/userController');
var router = express.Router();
const passport = require("passport");

/* GET home page. */
router.get('/', posts_get);

/* GET account page. */
router.get('/sign-up', function (req, res, next) {
    res.render('sign-up', { sheet: 'sign-up', user: req.user });
});

/* GET dice page. */
router.get('/dice', function (req, res, next) {
    res.render('dice', { sheet: 'dice', user: req.user });
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


// GET request for a user's profile page.
router.get('/users/:id', user_profile_get);


// GET request for sending a friend request.
router.post('/friends/add', friend_request_send_post);

// GET request for sending a friend request.
router.post('/friends/remove', friend_remove_post);

// GET request for sending a friend request.
router.post('/friends/accept', friend_request_accept_post);

// POST request for liking a comment.
router.post('/comments/like', comment_like_post);

// POST request for liking a post.
router.post('/posts/like', post_like_post);

// POST request for unliking a comment.
router.post('/comments/unlike', comment_unlike_post);

// POST request for unliking a post.
router.post('/posts/unlike', post_unlike_post);


// GET request for logging in with Facebook
router.get("/login/facebook", passport.authenticate("facebook"));

// GET callback for returning from facebook sign-in
router.get(
    "/login/facebook/callback",
    passport.authenticate("facebook", {
        successRedirect: "/",
        failureRedirect: "/sign-up"
    })
);


module.exports = router;

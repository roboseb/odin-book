const mongoose = require('mongoose');
const async = require('async');
const { body, validationResult } = require("express-validator");

const Comment = require('../models/comment');
const User = require('../models/user');
const Post = require('../models/post');

// POST request for adding a new message.
exports.new_post_post = [
    // Validate and sanitize message.
    body('content').trim(),
    body('title').trim(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        console.log('adding new post...')

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        User.findOne({ username: req.user.username }, (err, result) => {
            if (err) { return next(err); }

            // Create post object.
            var post = new Post (
                {
                    user: result,
                    username: result.username,
                    pic: result.pic,
                    likes: 0,
                    postDate: new Date(),
                    title: req.body.title,
                    content: req.body.content,
                    comments: [],
                    likedUsers: []
                }
            );

            if (!errors.isEmpty()) {
                // There are errors. Render form again with sanitized values/errors messages.
                console.log('got to these errors')
                res.render('index', { errors: errors, user: req.user })
                return;
            } else {
                // Data from form is valid.

                // Save user.
                post.save(function (err) {
                    // if (err) { return next(err); }
                    res.redirect('/')
                });
            }
        });
    }
];

// GET request for all posts/articles.
exports.posts_get = (req, res, next) => {
    async.parallel({
        post_list(callback) {
            Post.find({}).sort({postDate: -1}).exec(callback);
        },
        comment_list(callback) {
            Comment.find({}).sort({postDate: -1}).exec(callback);
        },
        user_list(callback) {
            User.find({}, callback);
        },
    },
        (err, results) => {
            console.log('fetching post data...')

            if (err) return next(err);

            res.render('index', { postlist: results.post_list, comment_list: results.comment_list, user_list: results.user_list, user: req.user})
        });
};

// POST request for liking a post.
exports.post_like_post = (req, res, next) => {
    async.parallel({

        // Add a like to the comment.
        like_post(callback) {
            Post.findOneAndUpdate({ _id: req.body.id }, { $inc: { likes: 1 } },
                callback);
        },

        // Add current user to comment's likes.
        add_user_to_likes(callback) {
            Post.findOneAndUpdate({ _id: req.body.id }, { $push: { likedUsers: req.user } },
                callback);
        },
    },
        (err, results) => {
            if (err) return next(err);

            // Add one like to comment's poster.
            User.findOneAndUpdate({ username: req.body.username },
                { $inc: { likes: 1 } },
                (err, results) => {
                    if (err) return next(err);

                    console.log('post liked succesfully!');
                    res.redirect('back');
                });
        });
}

// POST request for unliking a post.
exports.post_unlike_post = (req, res, next) => {
    async.parallel({

        // Add a like to the comment.
        unlike_post(callback) {
            Post.findOneAndUpdate({ _id: req.body.id }, { $inc: { likes: -1 } },
                callback);
        },

        // Add current user to comment's likes.
        remove_user_from_likes(callback) {
            Post.findOneAndUpdate({ _id: req.body.id }, { $pull: { likedUsers: req.user } },
                callback);
        },
    },
        (err, results) => {
            if (err) return next(err);

            // Remove one like from comment's poster.
            User.findOneAndUpdate({ username: req.body.username },
                { $inc: { likes: -1 } },
                (err, results) => {
                    if (err) return next(err);

                    console.log('post unliked succesfully!');
                    res.redirect('back');
                });
        });
}

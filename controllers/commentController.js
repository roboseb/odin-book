const mongoose = require('mongoose');
const async = require('async');
const { body, validationResult } = require("express-validator");

const Comment = require('../models/comment');
const User = require('../models/user');

// POST request for adding a new message.
exports.new_comment_post = [
    // Validate and sanitize message.
    body('comment').trim().isLength({ min: 1 }).withMessage('Comment must have content'),

    // Process request after validation and sanitization.
    (req, res, next) => {
        console.log('adding new message...')

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        User.findOne({ username: req.user.username }, (err, result) => {
            if (err) { return next(err); }

            // Create comment object.
            var comment = new Comment(
                {
                    comment: req.body.comment,
                    user: result,
                    username: result.username,
                    pic: result.pic,
                    likes: 0,
                    postDate: new Date(),
                    post: req.body.post,
                    likedUsers: []
                }
            );

            if (!errors.isEmpty()) {
                // There are errors. Render form again with sanitized values/errors messages.

                res.json({ errors: errors.array() });
                return;
            } else {
                // Data from form is valid.

                // Save user.
                comment.save(function (err) {
                    if (err) { return next(err); }
                    res.redirect('/');
                });
            }
        });
    }
];

// GET request for all comments.
exports.comments_get = (req, res, next) => {
    async.parallel({
        comment_list(callback) {
            Comment.find({}).sort({ postDate: -1 }).exec(callback); // Pass an empty object as match condition to find all documents of this collection
        },
    },
        (err, results) => {
            console.log('fetching comments...')

            if (err) return next(err);
            res.json({ comment_list: results.comment_list });
        });
};

// Like a comment, and increase the comment poster's like count.
exports.comment_like_post = (req, res, next) => {

    async.parallel({

        // Add a like to the comment.
        like_comment(callback) {
            Comment.findOneAndUpdate({ _id: req.body.id }, { $inc: { likes: 1 } },
                callback);
        },

        // Add current user to comment's likes.
        add_user_to_likes(callback) {
            Comment.findOneAndUpdate({ _id: req.body.id }, { $push: { likedUsers: req.user } },
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

                    console.log('comment liked succesfully!');
                    res.redirect('back');
                });
        });
}

// Unlike a comment, and decrease the comment poster's like count.
exports.comment_unlike_post = (req, res, next) => {

    async.parallel({

        // Remove a like from the comment.
        unlike_comment(callback) {
            Comment.findOneAndUpdate({ _id: req.body.id }, { $inc: { likes: -1 } },
                callback);
        },

        // Add current user to comment's likes.
        remove_from_user_likes(callback) {
            Comment.findOneAndUpdate({ _id: req.body.id }, { $pull: { likedUsers: {username: req.user.username} } },
                callback);
        },
    },
        (err, results) => {
            if (err) return next(err);

            console.log('unliking comment...')

            // Add one like to comment's poster.
            User.findOneAndUpdate({ username: req.body.username },
                { $inc: { likes: -1 } },
                (err, results) => {
                    if (err) return next(err);

                    console.log('comment unliked succesfully!');
                    res.redirect('back');
                });
        });
}
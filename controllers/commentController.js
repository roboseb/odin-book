const mongoose = require('mongoose');
const async = require('async');
const { body, validationResult } = require("express-validator");

const Comment = require('../models/comment');
const User = require('../models/user');

// POST request for adding a new message.
exports.new_comment_post = [
    // Validate and sanitize message.
    body('comment').trim().isLength({min: 1}).withMessage('Comment must have content'),

    // Process request after validation and sanitization.
    (req, res, next) => {
        console.log('adding new message...')

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        User.findOne({ username: req.user.username }, (err, result) => {
            if (err) { return next(err); }

            console.log(result);

            // Create comment object.
            var comment = new Comment(
                {
                    comment: req.body.comment,
                    user: result,
                    username: result.username,
                    pic: result.pic,
                    likes: 0,
                    postDate: new Date(),
                    post: req.body.post
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
            Comment.find({}).sort({postDate: -1}).exec(callback); // Pass an empty object as match condition to find all documents of this collection
        },
    },
        (err, results) => {
            console.log('fetching comments...')

            if (err) return next(err);
            res.json({comment_list: results.comment_list});
        });
};

// POST request for liking a comment.
exports.comment_like_post = (req, res, next) => {

    console.log(req.body.id);

    Comment.findOneAndUpdate({_id: req.body.id}, {$inc : {likes : 1}}, (err, response) => {
        console.log('liking comment...')

        if (err) return next(err);
        res.json('Comment liked succesfully');
    });
};
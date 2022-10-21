const User = require('../models/user');
const Die = require('../models/die');
const { validateConfirmPassword } = require('../validator')
const bcrypt = require('bcryptjs');
const passport = require("passport");

const mongoose = require('mongoose');
const async = require('async');
const { body, validationResult } = require("express-validator");

// Handle Author create on POST.
exports.user_create_post = [

    // Validate and sanitize fields.
    body('username').trim().isLength({ min: 3, max: 16 }).escape().withMessage('Username must be between 3 and 16 characters.'),
    [validateConfirmPassword],

    // Process request after validation and sanitization.
    (req, res, next) => {

        console.log('creating user...')

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create temp user info in case of error without saving data.
        var tempUser = new User(
            {
                username: req.body.username,
                password: req.body.password,
                admin: false,
                pic: req.body.pic,
                dice: [],
                setDice: {
                    1: null,
                    2: null,
                    3: null,
                    4: null,
                    5: null,
                    6: null
                },
                cards: [],
                cosmetics: [],
                joinDate: new Date(),
                likes: 0,
                friends: [],
                outgoingRequests: [],
                incomingRequests: []
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.

            res.render('sign-up', { title: 'Sign Up', user: tempUser, errors: errors.array(), sheet: 'sign-up' });
            return;
        } else {
            // Data from form is valid.

            // Encrypt password with bcrypt.
            bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
                if (err) {
                    // Error in hashing password. Rerender with data and error.
                    res.render('sign-up', { title: 'Sign Up', user: tempUser, errors: [err] });
                } else {
                    // Create Author object with escaped/trimmed/encrypted data.

                    var user = new User(
                        {
                            username: req.body.username,
                            password: hashedPassword,
                            admin: false,
                            pic: req.body.pic,
                            dice: [],
                            setDice: {
                                1: null,
                                2: null,
                                3: null,
                                4: null,
                                5: null,
                                6: null
                            },
                            cards: [],
                            cosmetics: [],
                            joinDate: new Date(),
                            likes: 0,
                            friends: [],
                            outgoingRequests: [],
                            incomingRequests: []
                        }
                    );

                    // Save user.
                    user.save(function (err) {
                        if (err) { return next(err); }
                        // Successful - redirect to home page.
                        res.redirect('/');
                    });
                }
            });
        }
    }
];

// Handle signing user in on POST.
exports.user_signin_post = (req, res, next) => {
    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            // *** Display message without using flash option
            // re-render the login form with a message
            return res.render('sign-up', { message: info.message, sheet: 'sign-up' })
        }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            return res.redirect('/');
        });
    })(req, res, next);
}

// GET request for viewing a user's profile.
exports.friend_request_send_post = (req, res, next) => {
    async.parallel({
        user_friended(callback) {
            User.findOne({
                username: req.user.username,
                friends: { username: req.body.username }
            }, callback);
        },
        user_requested(callback) {
            User.findOne({
                username: req.user.username,
                outgoingRequests: req.body.username
            }, callback);
        },
    },
        (err, results) => {
            console.log(req.body.username)

            if (err) return next(err);

            // User is already friends with other user.
            if (results.user_friended !== null) {
                console.log(`already friends with ${req.body.username}`)

                // User has already sent friend request to other user.
            } else if (results.user_requested !== null) {
                console.log(`already requested ${req.body.username}`)

                // Otherwise, send friend request to user.
            } else {
                console.log(`adding ${req.body.username} as friend...`)

                User.updateOne({ username: req.user.username }, { $push: { outgoingRequests: req.body.username } }, function (err, docs) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Added to  : ", docs);
                    }
                });

                User.updateOne({ username: req.body.username }, { $push: { incomingRequests: req.user.username } }, function (err, docs) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Added to incoming friends: ", docs);
                    }
                });

            }
        });
};

// Accept friend request.
exports.friend_request_accept_post = (req, res, next) => {

    async.parallel({

        //Remove all requests from current user.
        update_requests_1(callback) {
            User.updateOne({ username: req.user.username },
                { $pull: { incomingRequests: req.body.username } },
                callback);
        },

        //Remove all requests from accepted user.
        update_requests_2(callback) {
            User.updateOne({ username: req.body.username },
                { $pull: { outgoingRequests: req.user.username } },
                callback);
        },

        // Add friend for current user.
        update_requests_3(callback) {
            User.updateOne({ username: req.body.username },
                { $push: { friends: req.user } },
                callback);
        },

    },
        (err, results) => {
            console.log(`accepting friend:  ${req.body.username}...`);

            console.log(err);

            if (err) return next(err);

            User.find({ username: req.body.username }, (err, results) => {
                console.log('finding target user...')

                if (err) return next(err);

                User.updateOne({ username: req.user.username }, { $push: { friends: results[0] } }, (err, results) => {
                    res.render('profile', {
                        user: req.user,
                        user_preview: req.user,
                        sheet: 'profile'
                    })
                });
            });
        });
}

// Remove friend from both users' friends list.
exports.friend_remove_post = (req, res, next) => {

    async.parallel({

        //Remove friend from current user.
        remove_friend_1(callback) {
            User.updateOne({ username: req.user.username },
                { $pull: { friends: { username: req.body.username } } },
                callback);
        },

        //Remove friend from accepted user.
        remove_friend_2(callback) {
            User.updateOne({ username: req.body.username },
                { $pull: { friends: { username: req.user.username } } },
                callback);
        },
    },
        (err, results) => {
            console.log(`removing friend:  ${req.body.username}...`);

            res.render('profile', {
                user: req.user,
                user_preview: req.user,
                sheet: 'profile'
            })
        });
}

// GET request for viewing a user's profile.
exports.user_profile_get = (req, res, next) => {
    async.parallel({
        user(callback) {
            User.findOne({ username: req.params.id }, callback);
        },
    },
        (err, results) => {
            console.log('fetching your profile...')

            if (err) return next(err);

            res.render('profile', {
                user: req.user,
                user_preview: results.user,
                sheet: 'profile'
            })
        });
};

exports.memberize_post = (req, res, next) => {
    console.log(`memberizing ${req.body.id}...`);

    User.updateOne({ _id: req.body.id }, { member: true }, function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            console.log("Updated Docs : ", docs);
        }
    });
}

// Add a die to user's list of dice.
exports.die_add_post = (req, res, next) => {
    console.log('adding a die...');
    console.log(req.user)

    const newDie = JSON.parse(req.body.die)

    const die = new Die(newDie);



    User.updateOne({ _id: req.user._id }, { $push: { dice: die } }, function (err, results) {
        console.log(results)
        if (err) {
            console.log(err);
        } else {
            console.log("Die added : ", die);
        }
    });
}

// Set a die to a specific position in the user's favourite dice.
exports.die_set_post = (req, res, next) => {
    console.log('setting a die...');
    console.log(req.user._id);
    console.log(req.body.index);
    console.log(req.body.die);

    User.findById(req.user._id, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            const dice = result.setDice
            dice[req.body.index] = JSON.parse(req.body.die);

            User.findByIdAndUpdate(req.user._id, {setDice: dice}, function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Die set");
                }
            });
        }
    });
}

// Handle signing user out.
exports.user_signout_post = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
}


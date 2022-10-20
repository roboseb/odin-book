require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require("passport");
const strategy = require('passport-facebook');
const FacebookStrategy = strategy.Strategy;
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const bcrypt = require('bcryptjs');
var bodyParser = require('body-parser')

var app = express();

const formData = require('express-form-data');
const os = require("os");

const options = {
    uploadDir: os.tmpdir(),
    autoClean: true
};

const User = require('./models/user');

var indexRouter = require('./routes/index');

const compression = require("compression");
const helmet = require("helmet");

// Set up mongoose connection
const mongoose = require("mongoose");

const mongoDB = process.env.MONGODB_URI || dev_db_url;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(compression());
// app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(formData.parse(options));



passport.use(
    new LocalStrategy((username, password, done) => {
        User.findOne({ username: username }, (err, user) => {
            if (err) {
                return done(err);
            }
            if (!user) {
                console.log('no user found')
                return done(null, false, { message: "No account found with that username" });
            }

            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    // passwords match! log user in
                    return done(null, user)
                } else {
                    // passwords do not match!
                    return done(null, false, { message: "Incorrect password" })
                }
            })
        });
    })
);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL,
            profileFields: ["email", "name", "picture.type(large)", "id"]
        },
        function (accessToken, refreshToken, profile, done) {
            const { email, first_name, last_name, id } = profile._json;
            const userData = {
                username: `${first_name} ${last_name}`,
                password: id,
                pic: profile.photos ? profile.photos[0].value : '1',
                admin: false,
                dice: [],
                cards: [],
                cosmetics: [],
                joinDate: new Date(),
                likes: 0,
                friends: [],
                outgoingRequests: [],
                incomingRequests: []
            };

            // Check if Facebook account already has user in DB.
            User.findOne({ password: id }, (err, results) => {

                console.log(`https://graph.facebook.com/${profile.username}/picture?access_token=${accessToken}&&redirect=false`)

                if (err) { return next(err); }

                if (results === null) {
                    new User(userData).save();
                    done(null, userData);
                } else {
                    done(null, results);
                }
            });
        }
    )
);

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
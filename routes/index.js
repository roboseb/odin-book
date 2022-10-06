var express = require('express');
const { user_create_post } = require('../controllers/userController');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET account page. */
router.get('/sign-up', function(req, res, next) {
    res.render('sign-up');
  });

// POST for sign-up.
router.post('/sign-up', user_create_post);

module.exports = router;

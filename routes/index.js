var express = require('express');
var router = express.Router();
var db = require('../config/configDB');
/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('index', { title: 'Shop', user: req.user, cart: req.session.cart});
});

module.exports = router;

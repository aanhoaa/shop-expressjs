var express = require('express');
var router = express.Router();
const db = require('../helpers/db.helper')
const jwtHelper = require("../helpers/jwt.helper"); 

/* GET home page. */
router.get('/', async function(req, res, next) {
  var userInfo = null;

  if (req.session.token){
    const decoded = await jwtHelper.verifyToken(req.session.token, 'secret');
    username = decoded.data.username;
    userInfo = {username: decoded.data.username, gender: decoded.data.gender};
    console.log(userInfo)
  }

  res.render('index', { title: 'Shop', userInfo: userInfo, cart: req.session.cart});
});

module.exports = router;

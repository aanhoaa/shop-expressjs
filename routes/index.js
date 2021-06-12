var express = require('express');
var router = express.Router();
const db = require('../helpers/db.helper')
const jwtHelper = require("../helpers/jwt.helper"); 

/* GET home page. */
router.get('/', async function(req, res, next) {
  var userInfo = null;

  if (req.session.Userinfo) {
    userInfo = req.session.Userinfo;
  }

  const category = await db.getCategoryLevelOne();
  const products = await db.getListNewProduct();
  const topSell = await db.getListSeleldProduct([1]);

  res.render('index', { 
    title: 'Shop', 
    userInfo: userInfo, 
    cart: req.session.cart, 
    category: category,
    products: products,
    top: topSell,
  });
});


module.exports = router;

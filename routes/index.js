var express = require('express');
var router = express.Router();
const db = require('../helpers/db.helper')
const jwtHelper = require("../helpers/jwt.helper"); 
const {CF, evaluation} = require('nodeml');

/* GET home page. */
router.get('/', async function(req, res, next) {
  var userInfo = null;
  var recommendProduct = [];

  if (req.session.Userinfo) {
    userInfo = req.session.Userinfo;

    //handle recommend system
    //1. get array rating(user_id, product_id, rating)
    const listRating = await db.getRating();
    var train = new Array();
    listRating.forEach(item => {
      train.push([item.user_id, item.product_id, item.rating])
    })

    var userRecommend = new Array();
    listRating.forEach(item => {
        if (item.user_id == 6) {
          userRecommend.push([item.user_id, item.product_id, item.rating]);
        }
    })

    console.log('this is train dataset:', train);
    console.log('this is user data:', userRecommend)
    const cf = new CF();
    cf.train(train);
    let gt = cf.gt(userRecommend);
    recommendProduct = cf.recommendGT(gt, 6);
    console.log('recommendProduct:', recommendProduct)
  }

  const category = await db.getCategoryLevelOne();
  const products = await db.getListNewProduct();
  const topSell = await db.getListSeleldProduct([1]);
  var recommend = [];
  if (recommendProduct.length > 0) {
    recommendProduct.forEach(item => {
      recommend.push(item.itemId * 1)
    })
  }
  console.log('recommend', recommend)

  res.render('index', { 
    title: 'Trang chủ', 
    userInfo: userInfo, 
    cart: req.session.cart, 
    category: category,
    products: products,
    top: topSell,
    recommend: recommend
  });
});


module.exports = router;

var express = require('express');
var router = express.Router();
const db = require('../helpers/db.helper')
const CF = require('../helpers/collaborativeFiltering');
const evaluation = require('../helpers/evaluation')
const jwtHelper = require("../helpers/jwt.helper"); 

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

    var result = {};
    var result2 = {};
    train.forEach(value => {
      if (!result[value[0]]) {
        result[value[0]] = {};
      }
      result[value[0]][value[1]] = { rating: Number(value[2])};

      if (!result2[value[1]]) {
        result2[value[1]] = {};
      }
      result2[value[1]][value[0]] = { rating: Number(value[2])};
    })

    const ratingsGroupedByUser = result;
    const ratingsGroupedByProduct = result2;
    
    const cfItemBasedRecommendation = CF.predictWithCfItemBased(
      ratingsGroupedByUser, 
      ratingsGroupedByProduct,
      userInfo.id
    ); 
    recommendProduct = cfItemBasedRecommendation.map(item => {
        return Number(item.productId);
    })
  }
  const category = await db.getCategoryLevelOne();
  const products = await db.getListNewProduct();
  const topSell = await db.getListSeleldProduct([2]);
  const listPd = await db.getProductDetailByID();
  var isHasProduct = 0;

  for(let i of listPd) {
    if (recommendProduct.indexOf(i.id) > -1) isHasProduct++;
    if (isHasProduct > 0) {
      break;
    }
  }

  res.render('index', { 
    title: 'Trang chủ', 
    userInfo: userInfo, 
    cart: req.session.cart, 
    category: category,
    products: products,
    top: topSell,
    listPd: listPd,
    isHasProduct: isHasProduct,
    recommend: recommendProduct
  });
});


module.exports = router;

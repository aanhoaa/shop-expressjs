var express = require("express");
var router = express.Router();
const shopController = require("../controllers/shop.controller");
const authController = require("../controllers/auth.controller");

/* GET home page. */
// router.get('/', function(req, res, next) {
//     res.render('index', { title: 'Shop' });
// });

router.get("/", shopController.getIndexShop);
router.get("/product", shopController.getProducts);
router.get("/product/:productId", shopController.getProductDetail);
router.get("/product/detail/:productId", shopController.getProductDetailInfo);
router.post("/product/:productId", shopController.postProductBuy);

router.post("/filter", shopController.postProductFilter);
router.post("/sortby", shopController.postProductSortBy);
router.post("/cateFilter", shopController.postProductCateFilter);

router.get("/cart", authController.isLogin, shopController.getCart);
router.get("/cart/delete", authController.isLogin, shopController.getDeleteCart);

router.get("/checkout", authController.isLogin, shopController.getCheckout);
router.post("/checkout", authController.isLogin, shopController.postCheckout);
router.get("/checkouted", authController.isLogin, shopController.getCheckouted);



module.exports = router;
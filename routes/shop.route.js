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

router.get("/filter", shopController.getProductFilter);

router.get("/cart", authController.isLogin, shopController.getCart);
router.get("/cart/delete", authController.isLogin, shopController.getDeleteCart);

router.get("/checkout", authController.isLogin, shopController.getCheckout);
router.post("/checkout", authController.isLogin, shopController.postCheckout);



module.exports = router;
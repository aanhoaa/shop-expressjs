var express = require("express");
var router = express.Router();
const shopController = require("../controllers/shop.controller");
const authController = require("../controllers/auth.controller");


router.get("/product/:cateOneId", shopController.getProducts);
router.get("/product/detail/:productId", shopController.getProductDetail);
router.get("/getproductinfo", shopController.getProductDetailInfo);
router.post("/product/:productId", shopController.postProductBuy);

router.post("/cart/add_to_cart", authController.isAuth, authController.isUser, shopController.postAddToCart);


router.post("/filter", shopController.postProductFilter);
router.post("/sortby", shopController.postProductSortBy);
router.post("/cateFilter", shopController.postProductCateFilter);

router.get("/cart", authController.isLogin, shopController.getCart);
router.get("/cart/delete", authController.isLogin, shopController.getDeleteCart);

router.get("/checkout", authController.isLogin, shopController.getCheckout);
router.post("/checkout", authController.isLogin, shopController.postCheckout);
router.get("/checkouted", authController.isLogin, shopController.getCheckouted);

// router.get("/", shopController.getShop);
// router.post("/", shopController.postShop);



module.exports = router;
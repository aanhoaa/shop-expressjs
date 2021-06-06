var express = require("express");
var router = express.Router();
const shopController = require("../controllers/shop.controller");
const authController = require("../controllers/auth.controller");


router.get("/product/*.:cateOneId", shopController.getProducts);
router.get("/cate/*.:cateTwoId", shopController.getProductsCateTwo);
router.get("/detail/*.:productId", shopController.getProductDetail);
router.get("/getproductinfo", shopController.getProductDetailInfo);
router.post("/product/*.:productId", shopController.postProductBuy);

router.get("/shop/*.:shopId", shopController.getShopProduct);

router.get("/cart", authController.isAuth, authController.isUser, shopController.getCart);
router.post("/cart/add_to_cart", authController.isAuth, authController.isUser, shopController.postAddToCart);
router.post("/cart/update_to_cart", authController.isAuth, authController.isUser, shopController.postUpdateToCart);
router.get("/cart/update", authController.isAuth, authController.isUser, shopController.getCartInfo);
router.post("/cart/delete", authController.isAuth, authController.isUser, shopController.postDeleteCart);

router.get("/checkout", authController.isAuth, authController.isUser, shopController.getCheckout);
router.post("/checkout", authController.isAuth, authController.isUser, shopController.postCheckout);
router.get("/checkouted", authController.isLogin, shopController.getCheckouted);

// router.get("/", shopController.getShop);
// router.post("/", shopController.postShop);

router.post("/filter", shopController.postProductFilter);
router.post("/sortby", shopController.postProductSortBy);
router.post("/cateFilter", shopController.postProductCateFilter);

router.get("/cart/delete", authController.isLogin, shopController.getDeleteCart);



module.exports = router;
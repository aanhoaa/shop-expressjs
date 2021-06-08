var express = require('express');
var router = express.Router();
var passport = require("passport");
const authController = require("../controllers/auth.controller");
const sellerController = require("../controllers/seller.controller");

router.post("/register" , sellerController.postRegister);

router.get("/login" , sellerController.getLogin);
router.post("/login" , sellerController.postLogin);
router.get("/logout" , sellerController.getLogout);

router.get("/" , authController.isAuth,authController.isShop, sellerController.getHome);

router.get("/category" , authController.isAuth, authController.isShop, sellerController.getCategory);
router.get("/category/add" , authController.isAuth, authController.isShop, sellerController.getAddCategory);
router.post("/category/add" , authController.isAuth, authController.isShop, sellerController.postAddCategory);
router.get("/category/edit/:parentId/:childId" , authController.isAuth, authController.isShop, sellerController.getEditCategory);
router.post("/category/edit/:parentId/:childId" , authController.isAuth, authController.isShop, sellerController.postEditCategory);
router.get("/category/delete/:parentId/:childId" , authController.isAuth, authController.isShop, sellerController.getDeleteCategory);

router.get("/product/add" , authController.isAuth, authController.isShop, sellerController.getAddProduct);
router.get("/product/add/binding/:parentId" ,authController.isAuth, authController.isShop, sellerController.getBindingCategory);
router.post("/product/add" , authController.isAuth, authController.isShop, sellerController.handleImg, sellerController.postAddProduct);
router.get("/product/edit/:productId" , authController.isAuth, authController.isShop, sellerController.getEditProduct);
router.post("/product/edit/:productId" , authController.isAuth, authController.isShop, sellerController.handleImg, sellerController.postEditProduct);
router.get("/product/edit/variant/:productId" , authController.isAuth, authController.isShop, sellerController.getEditProductVariant);
router.post("/product/edit/variant/:productId" , authController.isAuth, authController.isShop, sellerController.postEditProductVariant);
router.post("/product/show/:productId" , authController.isAuth, authController.isShop, sellerController.postShowProduct);
router.post("/product/delete" , authController.isAuth, authController.isShop, sellerController.postDeleteProduct);
router.get("/order" , authController.isAuth, authController.isShop, sellerController.getOrder);
router.get("/order/detail/:orderId" , authController.isAuth, authController.isShop, sellerController.getOrderDetail);
router.put("/order/delivery" , authController.isAuth, authController.isShop, sellerController.putDeliveryOrder);
router.put("/order/delivered" , authController.isAuth, authController.isShop, sellerController.putDeliveredOrder);

module.exports = router;
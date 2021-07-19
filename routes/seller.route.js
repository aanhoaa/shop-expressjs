var express = require('express');
var router = express.Router();
var passport = require("passport");
const authController = require("../controllers/auth.controller");
const sellerController = require("../controllers/seller.controller");

router.post("/register" , sellerController.postRegister);

router.get("/login" , sellerController.getLogin);
router.post("/login" , sellerController.postLogin);
router.get("/logout" , sellerController.getLogout);

router.get("/dashboard" , authController.isAuth, authController.isShop, sellerController.getDashBoard);
router.get("/" , authController.isAuth, authController.isShop, sellerController.getDashBoards);


router.get("/product" , authController.isAuth, authController.isShop, sellerController.getHome);

router.get("/profile/address-book" , authController.isAuth, authController.isShop, sellerController.getAddressBook);
router.post("/profile/address-book" , authController.isAuth, authController.isShop, sellerController.postAddressBook);

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

router.get("/finance/income" , authController.isAuth, authController.isShop, sellerController.getIncome);
router.get("/finance/analyst" , authController.isAuth, authController.isShop, sellerController.getAnalyst);
router.get("/finance/wallet" , authController.isAuth, authController.isShop, sellerController.getWallet);

router.post("/api/finance/income" , authController.isAuth, authController.isShop, sellerController.postBindingIncome);

router.get("/sales" , authController.isAuth, authController.isShop, sellerController.getSales);
router.post("/sales" , authController.isAuth, authController.isShop, sellerController.postSales);
router.get("/sales/*.:voucherId" , authController.isAuth, authController.isShop, sellerController.getEditSales);
router.post("/sales/*.:voucherId" , authController.isAuth, authController.isShop, sellerController.postEditSales);
router.put("/api/sales/update" , authController.isAuth, authController.isShop, sellerController.postUpdateSale);
router.delete("/api/sales/delete" , authController.isAuth, authController.isShop, sellerController.postDeleteSale);

router.post("/profile/address/edit/:bookId", authController.isAuth, authController.isShop, sellerController.postUpdateAddressBook);
router.post("/profile/address/delete", authController.isAuth, authController.isShop, sellerController.postDeleteAddressBook);
router.post("/profile/address/default", authController.isAuth, authController.isShop, sellerController.postSetAddressDefault);

module.exports = router;
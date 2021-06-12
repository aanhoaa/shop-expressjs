var express = require('express');
var router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

/* GET users listing. */
router.get("/account/profile", authController.isAuth, authController.isUser, userController.getUserProfile);
router.post("/account/profile", authController.isAuth, authController.isUser, userController.postUserProfile);
router.get("/account/address", authController.isAuth, authController.isUser, userController.getUserAddressBook);
router.post("/account/address", authController.isAuth, authController.isUser, userController.postUserAddressBook);
router.get("/account/password", authController.isAuth, authController.isUser, userController.getChangePassword);
router.post("/account/password", authController.isAuth, authController.isUser, userController.postChangePassword);
router.post("/account/reset", authController.isAuth, authController.isUser, userController.postReset);
router.post("/account/address/edit/:bookId", authController.isAuth, authController.isUser, userController.postUpdateAddressBook);
router.post("/account/address/delete", authController.isAuth, authController.isUser, userController.postDeleteAddressBook);
router.post("/account/address/default", authController.isAuth, authController.isUser, userController.postSetAddressDefault);
router.get("/recent", authController.isAuth, authController.isUser, userController.getProductRecent);

//router.get("/purchase", authController.isAuth, authController.isUser, userController.getPurchase);
router.get("/purchase", authController.isAuth, authController.isUser, userController.getWaitingConfirm);
router.get("/purchase/order/:orderId", authController.isAuth, authController.isUser, userController.getOrderDetail);
router.put("/purchase/cancel", authController.isAuth, authController.isUser, userController.putOrderCancel);
router.put("/purchase/rating", authController.isAuth, authController.isUser, userController.putUserRating);


module.exports = router;

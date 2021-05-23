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

//api binding adddress
router.get("/api/account/city", authController.isAuth, authController.isUser, userController.getCity);
router.get("/api/account/district/binding", authController.isAuth, authController.isUser, userController.getBindingDistrict);
router.get("/api/account/ward/binding", authController.isAuth, authController.isUser, userController.getBindingWard);

module.exports = router;

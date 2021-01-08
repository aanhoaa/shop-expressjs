var express = require('express');
var passport = require("passport");
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
var router = express.Router();


router.get("/login", authController.getLogin);
router.get("/auth/google", authController.getLoginByGoogle);
router.get("/auth/google/callback", authController.getLoginByGoogleCallBack);
router.post("/login", authController.postLogin);
router.get("/logout", authController.getLogout);
router.get("/register", authController.getSignUp);
router.post("/register", authController.postSignUp);
router.get("/forgot-password", authController.getForgotPass);
router.post("/forgot-password", authController.postForgotPass);

router.get("/user", authController.isLogin, userController.getUserInfo);
router.get("/user/edit", authController.isLogin, userController.getEditUserInfo);
router.post("/user/edit", authController.isLogin, userController.postEditUserInfo);
router.get("/user/:orderId", authController.isLogin, userController.getDetailOrder);

module.exports = router;
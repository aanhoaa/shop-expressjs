var express = require('express');
var passport = require("passport");
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
var router = express.Router();


router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.getLogout);
router.get("/register", authController.getSignUp);
router.post("/register", authController.postSignUp);
router.get("/forgot-password", authController.getForgotPassword);
router.post("/forgot-password", authController.postForgotPassword);

router.get("/verify", authController.isAuth, authController.getVerify);
router.post("/verify", authController.isAuth, authController.postVerify);
router.post("/resend/verify", authController.isAuth, authController.postResendVerify);

module.exports = router;
var express = require('express');
var router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

/* GET users listing. */
router.get("/", authController.isAuth, authController.isUser, userController.getUserInfo);

module.exports = router;

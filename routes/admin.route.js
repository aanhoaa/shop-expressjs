var express = require('express');
var router = express.Router();
const authController = require("../controllers/auth.controller");
const adminController = require("../controllers/admin.controller");

router.get("/login" , adminController.getLogin);
router.post("/login" , adminController.postLogin);

router.get("/" , authController.isAuth, authController.isAdmin, adminController.getHome);

module.exports = router;
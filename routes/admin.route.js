var express = require('express');
var router = express.Router();
const authController = require("../controllers/auth.controller");
const adminController = require("../controllers/admin.controller");

router.get("/login" , adminController.getLogin);
router.post("/login" , adminController.postLogin);
router.get("/logout" , authController.isAuth, authController.isAdmin, adminController.getLogout);

router.get("/" , authController.isAuth, authController.isAdmin, adminController.getHome);
router.get("/product/view/:productId" , authController.isAuth, authController.isAdmin, adminController.getViewProduct);
router.post("/product/view/:productId" , authController.isAuth, authController.isAdmin, adminController.postViewProduct);
router.get("/category" , authController.isAuth, authController.isAdmin, adminController.getCategory);
router.get("/category/add" , authController.isAuth, authController.isAdmin, adminController.getAddCategory);
router.post("/category/add" , authController.isAuth, authController.isAdmin, adminController.postAddCategory);

router.post("/product/edit/status" , authController.isAuth, authController.isAdmin, adminController.postEditStatusProduct);

module.exports = router;
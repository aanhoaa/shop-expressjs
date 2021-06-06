var express = require('express');
var router = express.Router();
const authController = require("../controllers/auth.controller");
const adminController = require("../controllers/admin.controller");

router.get("/login" , adminController.getLogin);
router.post("/login" , adminController.postLogin);
router.get("/logout" , adminController.getLogout);

router.get("/" , authController.isAuth, authController.isAdmin, adminController.getHome);
router.get("/product/view/:productId" , authController.isAuth, authController.isAdmin, adminController.getViewProduct);
router.post("/product/view/:productId" , authController.isAuth, authController.isAdmin, adminController.postViewProduct);
router.get("/category" , authController.isAuth, authController.isAdmin, adminController.getCategory);
router.get("/category/add" , authController.isAuth, authController.isAdmin, adminController.getAddCategory);
router.post("/category/add" , authController.isAuth, authController.isAdmin, adminController.postAddCategory);
router.put("/category/edit" , authController.isAuth, authController.isAdmin, adminController.putEditNameCategory);
router.post("/product/edit/status" , authController.isAuth, authController.isAdmin, adminController.postEditStatusProduct);
router.get("/profile/shop" , authController.isAuth, authController.isAdmin, adminController.getProfileShop);
router.get("/profile/user" , authController.isAuth, authController.isAdmin, adminController.getProfileUser);
router.delete("/user/delete" , authController.isAuth, authController.isAdmin, adminController.deleteUser);
router.get("/order" , authController.isAuth, authController.isAdmin, adminController.getOrder);
router.get("/order/detail/:orderId" , authController.isAuth, authController.isAdmin, adminController.getOrderDetail);
router.put("/order/confirm" , authController.isAuth, authController.isAdmin, adminController.putConfirmOrder);
router.put("/order/cancel" , authController.isAuth, authController.isAdmin, adminController.putCancelOrder);


module.exports = router;
var express = require('express');
var router = express.Router();
const authController = require("../controllers/auth.controller");
const adminController = require("../controllers/admin.controller");

router.use(function (req, res, next) {
    res.locals.permit = req.session.permit;
    res.locals.admin = req.session.admin;
    next();
});


router.get("/login" , adminController.getLogin);
router.post("/login" , adminController.postLogin);
router.get("/logout" , adminController.getLogout);

router.get("/dashboard" , authController.isAuth, authController.checkRole('VIEW PRODUCT'), adminController.getDashboard);
router.get("/" , authController.isAuth, authController.checkRole('VIEW PRODUCT'), adminController.getDashboard);

router.get("/product" , authController.isAuth, authController.checkRole('VIEW PRODUCT'), adminController.getHome);
router.get("/product/view/:productId" , authController.isAuth, authController.checkRole('VIEW PRODUCT'), adminController.getViewProduct);
router.post("/product/view/:productId" , authController.isAuth, authController.isAdmin, adminController.postViewProduct);
router.get("/category" , authController.isAuth, authController.checkRole('VIEW CATEGORY'), adminController.getCategory); 
router.get("/category/add" , authController.isAuth, authController.isCategoryAdmin, adminController.getAddCategory);
router.post("/category/add" , authController.isAuth, authController.isAdmin, adminController.postAddCategory);
router.put("/category/edit" , authController.isAuth, authController.isAdmin, adminController.putEditNameCategory);
router.post("/product/edit/status" , authController.isAuth, authController.isAdmin, adminController.postEditStatusProduct);
router.get("/profile/shop" , authController.isAuth, authController.isAdmin, adminController.getProfileShop);
router.get("/shop/*.:shopId" , authController.isAuth, authController.isAdmin, adminController.getShopDetail);
router.put("/lock/shop" , authController.isAuth, authController.isAdmin, adminController.putShopLock);
router.get("/profile/user" , authController.isAuth, authController.isAdmin, adminController.getProfileUser);
router.get("/profile/employee" , authController.isAuth, authController.isAdmin, adminController.getProfileEmployee);
router.get("/profile/check/employee" , authController.isAuth, authController.isAdmin, adminController.getCheckUserName);
router.post("/profile/employee" , authController.isAuth, authController.isAdmin, adminController.postProfileEmployee);
router.get("/profile/employee/*.:employeeId" , authController.isAuth, authController.isAdmin, adminController.getDetailEmployee);
router.post("/profile/employee/*.:employeeId" , authController.isAuth, authController.isAdmin, adminController.postDetailEmployee);
router.delete("/user/delete" , authController.isAuth, authController.isAdmin, adminController.deleteUser);
router.get("/order" , authController.isAuth, authController.checkRole('VIEW ORDER'), adminController.getOrder);
router.get("/order/detail/:orderId" , authController.isAuth, authController.isAdmin, adminController.getOrderDetail);
router.put("/order/confirm" , authController.isAuth, authController.isAdmin, adminController.putConfirmOrder);
router.put("/order/cancel" , authController.isAuth, authController.isAdmin, adminController.putCancelOrder);
router.put("/order/delivered" , authController.isAuth, authController.isAdmin, adminController.putDeliveredOrder);
router.get("/sales" , authController.isAuth, authController.isAdmin, adminController.getSales)
module.exports = router;

var express = require('express');
var router = express.Router();
var passport = require("passport");
const authController = require("../controllers/auth.controller");
const adminController = require("../controllers/admin.controller");

router.get("/" , authController.isAuth,authController.isShop, adminController.getHome);

router.get("/category" , authController.isAuth, authController.isShop, adminController.getCategory);
router.get("/category/add" , authController.isAuth, authController.isShop, adminController.getAddCategory);
router.post("/category/add" , authController.isAuth, authController.isShop, adminController.postAddCategory);
router.get("/category/edit/:parentId/:childId" , authController.isAuth, authController.isShop, adminController.getEditCategory);
router.post("/category/edit/:parentId/:childId" , authController.isAuth, authController.isShop, adminController.postEditCategory);
router.get("/category/delete/:parentId/:childId" , authController.isAuth, authController.isShop, adminController.getDeleteCategory);

router.get("/product/add" , authController.isAuth, authController.isShop, adminController.getAddProduct);
router.get("/product/add/binding/:parentId" ,authController.isAuth, authController.isShop, adminController.getBindingCategory);
router.post("/product/add" , authController.isAuth, authController.isShop, adminController.handleImg, adminController.postAddProduct);
router.get("/product/edit/:productId" , authController.isAuth, authController.isShop, adminController.getEditProduct);
router.post("/product/edit/:productId" , authController.isAuth, authController.isShop, adminController.handleImg, adminController.postEditProduct);
router.get("/product/edit/variant/:productId" , authController.isAuth, authController.isShop, adminController.getEditProductVariant);
router.post("/product/edit/variant/:productId" , authController.isAuth, authController.isShop, adminController.postEditProductVariant);
router.post("/product/setPrice" , authController.isAuth, authController.isShop, adminController.postSetPrice);

router.get("/supplier" , authController.isAdmin, adminController.getSupplier);
router.get("/supplier/add" , authController.isAdmin, adminController.getAddSupplier);
router.post("/supplier/add" , authController.isAdmin, adminController.postAddSupplier);
router.get("/supplier/edit/:suppId" , authController.isAdmin, adminController.getEditSupplier);
router.post("/supplier/edit/:suppId" , authController.isAdmin, adminController.postEditSupplier);

router.get("/inventory" , authController.isAdmin, adminController.getInventory);
router.get("/inventory/detail/:productId" , authController.isAdmin, adminController.getInventoryDetail);
router.get("/inventory/add" , authController.isAdmin, adminController.getAddInventory);
router.post("/inventory/add" , authController.isAdmin, adminController.postAddInventory);
router.get("/inventory/add/binding/:cateId" , authController.isAdmin, adminController.getBindingInventory);
router.post("/inventory/search" , authController.isAdmin, adminController.postSearchInventory);
router.get("/inventory/import" , authController.isAdmin, adminController.getImportInventory);
router.get("/inventory/import/edit/:importId" , authController.isAdmin, adminController.getEditImportInventory);
router.post("/inventory/import/edit/:importId" , authController.isAdmin, adminController.postEditImportInventory);

router.get("/order" , authController.isAdmin, adminController.getOrder);
router.get("/order/detail/:orderId" , authController.isAdmin, adminController.getOrderDetail);
router.post("/order/detail/:orderId" , authController.isAdmin, adminController.postOrderDetail);
router.get("/order/confirm/:orderId" , authController.isAdmin, adminController.getConfirm);
router.get("/order/confirm-arrive/:orderId" , authController.isAdmin, adminController.getConfirmArrive);

router.get("/shipping" , authController.isAdmin, adminController.getShipping);
router.get("/shipping/add" , authController.isAdmin, adminController.getAddShipping);
router.post("/shipping/add" , authController.isAdmin, adminController.postAddShipping);

router.get("/report/inventory" , authController.isAdmin, adminController.getReportInventory);
router.get("/report/income" , authController.isAdmin, adminController.getReportIncome);

module.exports = router;
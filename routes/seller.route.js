var express = require('express');
var router = express.Router();
var passport = require("passport");
const authController = require("../controllers/auth.controller");
const sellerController = require("../controllers/seller.controller");

router.get("/login" , sellerController.getLogin);
router.post("/login" , sellerController.postLogin);
router.get("/logout" , sellerController.getLogout);

router.get("/" , authController.isAuth,authController.isShop, sellerController.getHome);

router.get("/category" , authController.isAuth, authController.isShop, sellerController.getCategory);
router.get("/category/add" , authController.isAuth, authController.isShop, sellerController.getAddCategory);
router.post("/category/add" , authController.isAuth, authController.isShop, sellerController.postAddCategory);
router.get("/category/edit/:parentId/:childId" , authController.isAuth, authController.isShop, sellerController.getEditCategory);
router.post("/category/edit/:parentId/:childId" , authController.isAuth, authController.isShop, sellerController.postEditCategory);
router.get("/category/delete/:parentId/:childId" , authController.isAuth, authController.isShop, sellerController.getDeleteCategory);

router.get("/product/add" , authController.isAuth, authController.isShop, sellerController.getAddProduct);
router.get("/product/add/binding/:parentId" ,authController.isAuth, authController.isShop, sellerController.getBindingCategory);
router.post("/product/add" , authController.isAuth, authController.isShop, sellerController.handleImg, sellerController.postAddProduct);
router.get("/product/edit/:productId" , authController.isAuth, authController.isShop, sellerController.getEditProduct);
router.post("/product/edit/:productId" , authController.isAuth, authController.isShop, sellerController.handleImg, sellerController.postEditProduct);
router.get("/product/edit/variant/:productId" , authController.isAuth, authController.isShop, sellerController.getEditProductVariant);
router.post("/product/edit/variant/:productId" , authController.isAuth, authController.isShop, sellerController.postEditProductVariant);
router.post("/product/show/:productId" , authController.isAuth, authController.isShop, sellerController.postShowProduct);
router.post("/product/delete" , authController.isAuth, authController.isShop, sellerController.postDeleteProduct);

router.get("/supplier" , authController.isAdmin, sellerController.getSupplier);
router.get("/supplier/add" , authController.isAdmin, sellerController.getAddSupplier);
router.post("/supplier/add" , authController.isAdmin, sellerController.postAddSupplier);
router.get("/supplier/edit/:suppId" , authController.isAdmin, sellerController.getEditSupplier);
router.post("/supplier/edit/:suppId" , authController.isAdmin, sellerController.postEditSupplier);

router.get("/inventory" , authController.isAdmin, sellerController.getInventory);
router.get("/inventory/detail/:productId" , authController.isAdmin, sellerController.getInventoryDetail);
router.get("/inventory/add" , authController.isAdmin, sellerController.getAddInventory);
router.post("/inventory/add" , authController.isAdmin, sellerController.postAddInventory);
router.get("/inventory/add/binding/:cateId" , authController.isAdmin, sellerController.getBindingInventory);
router.post("/inventory/search" , authController.isAdmin, sellerController.postSearchInventory);
router.get("/inventory/import" , authController.isAdmin, sellerController.getImportInventory);
router.get("/inventory/import/edit/:importId" , authController.isAdmin, sellerController.getEditImportInventory);
router.post("/inventory/import/edit/:importId" , authController.isAdmin, sellerController.postEditImportInventory);

router.get("/order" , authController.isAdmin, sellerController.getOrder);
router.get("/order/detail/:orderId" , authController.isAdmin, sellerController.getOrderDetail);
router.post("/order/detail/:orderId" , authController.isAdmin, sellerController.postOrderDetail);
router.get("/order/confirm/:orderId" , authController.isAdmin, sellerController.getConfirm);
router.get("/order/confirm-arrive/:orderId" , authController.isAdmin, sellerController.getConfirmArrive);

router.get("/shipping" , authController.isAdmin, sellerController.getShipping);
router.get("/shipping/add" , authController.isAdmin, sellerController.getAddShipping);
router.post("/shipping/add" , authController.isAdmin, sellerController.postAddShipping);

router.get("/report/inventory" , authController.isAdmin, sellerController.getReportInventory);
router.get("/report/income" , authController.isAdmin, sellerController.getReportIncome);

module.exports = router;
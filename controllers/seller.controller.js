const passport = require("passport");
const multer = require('multer');
const User = require("../models/user.model");
const Category = require("../models/category.model");
const Material = require("../models/material.model");
const Brand = require("../models/brand.model");
const Product = require("../models/product.model");
const Supplier = require("../models/supplier.model");
const Inventory = require("../models/inventory.model");
const Import = require("../models/import.model");
const { count } = require("../models/user.model");
const Order = require("../models/order.model");
const db = require('../helpers/db.helper');
const cloudinary = require('cloudinary');
var bcrypt = require("bcryptjs");
const jwtHelper = require("../helpers/jwt.helper"); 

cloudinary.config({
    cloud_name: 'do3we3jk1',
    api_key: 554259798325127,
    api_secret: 'EidUs6TZ54dIS1HRxdurHuQS4hw'
});

// SET STORAGE
var storage = multer.diskStorage({});

var upload = multer({ storage: storage });

exports.handleImg = upload.fields([
    {
        name: 'image_product',
        maxCount: 1
    },
    {
        name: 'image_product_multiple1',
        maxCount: 1
    },
    {
        name: 'image_product_multiple2',
        maxCount: 1
    },
    {
        name: 'image_product_multiple3',
        maxCount: 1
    }
])

exports.getLogin = (req, res, next) => {  
    if (req.session.token) 
    res.redirect('/seller');
    else
    res.render('shop/admin/login');
}

exports.postLogin = async (req, res, next) => {
    const {username, password} = req.body;
   
    const data = await db.checkUserExist(3, [username]); 
    if (data) {
      const userPass = await db.getUserInfo(3,[username]);
      const checkPass = await bcrypt.compare(password, userPass.password);
      
      if (checkPass) {
        const userInfo = {
          id: userPass.id,
          username: username,
          role: userPass.role
        }
        const accessToken = await jwtHelper.generateToken(userInfo, 'secret', '1h');

        req.session.token = accessToken;
        return res.status(200).json({accessToken});
      }
    }

    return res.status(500).json();
}

exports.getLogout = (req, res, next) => {
    req.session.destroy();
    res.redirect('/');
}

exports.getHome = async (req, res, next) => {
    const shopId = req.jwtDecoded.data.id;
    var oData = new Array;
    const data = await db.getProductByShop([shopId]);

    for(let i = 0; i< data.length; i++) {
        var info = await db.getProductVariantInfo([data[i].id]);
        var violate = '';
        if (data[i].status == -1) {
            violate = await db.getProductViolate([data[i].id]);
        }
        if (violate != '') {
            var time = violate[0].updated_at.toString();
            
            oData.push(
                {
                    name: data[i].name, sku: data[i].sku, classify: info, 
                    id: data[i].id, status: data[i].status,
                    vname: violate[0].name, vreason: violate[0].reason, 
                    vsuggestion: violate[0].suggestion, vtime: getdate(time.substring(0, time.length-1))
                }
            )
        }
        else {
            oData.push({
                name: data[i].name, sku: data[i].sku, 
                classify: info, id: data[i].id, 
                status: data[i].status
              })
        }
            
    }
    
    res.render('./admin/index', {data: oData})
}

exports.getCategory = (req, res, next) => {
    res.render('./admin/category/category');
}

exports.getAddCategory = (req, res, next) => {
    const message = req.flash("error")[0];
    res.render('./admin/category/addCategory');
}

exports.postAddCategory = (req, res, next) => { 
    Category.findById(req.body.id, function(err, data) {
        if (err) console.log(err);
        else {
            data.childCateName.push({childName: req.body.childCateName});
            data.save();
            req.flash('success_msg', 'Thêm thành công');
            res.redirect('/admin/category/add/');
        }
    });
}

exports.getEditCategory = (req, res, next) => {
    var parentId = req.params.parentId;
    var childId = req.params.childId;

    Category.find().then((data)=>{
        res.render('./admin/category/editCategory', {parentId: parentId, childId: childId, data: data});
    })
}

exports.postEditCategory = (req, res, next) => {
    var parentId = req.params.parentId;
    var childId = req.params.childId;

    Category.findById(parentId, function(err, data){
        if (err) console.log(err);
        else {
            data.childCateName.forEach((item)=>{
                if (item._id == childId)
                {
                    item.childName = req.body.childCateName;
                    data.save();
                    res.redirect('/admin/category/');
                }
            })
        }
    })
}

exports.getDeleteCategory = (req, res, next) => {
    var parentId = req.params.parentId;
    var childId = req.params.childId;

    Category.findById(parentId, function(err, data){
        if (err) console.log(err);
        else {
            data.childCateName.forEach((item)=>{
                if (item._id == childId)
                {
                    var index = data.childCateName.indexOf(item);
                    
                    if (index > -1)
                    {
                        data.childCateName.splice(index, 1);
                        data.save();
                        res.redirect('/admin/category/');
                    }
                }
            })   
        }
    })
}

exports.getAddProduct = async (req, res, next) => {
   
    const data = await db.getCategoryLevelOne();
    
    res.render('./admin/product/addProduct', {data: data});
}

exports.getBindingCategory = async (req, res, next) => {
    var parentId = req.params.parentId;
    var bind = new Array;

    const data = await db.getCategoryLevelTwo([parentId]);
    data.forEach(item => {
        bind.push({id: item.id, name: item.name});
    })

    res.send(JSON.stringify(bind));
}

exports.postAddProduct = async (req, res, next) => {
    const shopId = req.jwtDecoded.data.id;
    const SKU = '';
    const price = 0;
    const stock = 0;
    const status = 0;
    const {brand, cate1, cate2, material, name, sku, description, size, color} = req.body;
    var arrSize, arrColor;
    var arrVariantId = [];
    const imgCover = req.files.path;

    //check before save db
    if (brand == '' || cate1 == '' || cate2 == '' || name == '' || material == '' || imgCover == '')
        return res.status(500).json();

    if (size != '' || color != '') {
        //save to variant detail
        if (size != '')
            arrSize = size.split(',');
        else arrSize = [1];
        if (color != '')
            arrColor = color.split(',');
        else arrColor = [1];

        arrSize.forEach(item => {
            arrColor.forEach(async i => {
                
                if (item == 1)
                    var saveVD = [{Color: i}];
                else if (i == 1) {
                    var saveVD = [{Size: item}];
                } else {
                    var saveVD = [{Size: item, Color: i}];
                }
                
                var variantId = await db.insertVariantDetail(saveVD);
                if (variantId) arrVariantId.push(variantId);
                else return res.status(500).json();
            })
        })
        
    }

    //save to product
    const savePD = [cate1, cate2, shopId, name , description, status, material, sku];
    const productId = await db.insertProduct(savePD);

   if (productId) {
    //save to images
    const saveImgCover =  await cloudinary.v2.uploader.upload(req.files['image_product'][0].path);
    const imgCover = saveImgCover.secure_url;
    var sub1 = '';
    var sub2 = '';
    var sub3 = '';

    if (req.files['image_product_multiple1']) {
        var saveImgSub =  await cloudinary.v2.uploader.upload(req.files['image_product_multiple1'][0].path);
        sub1 = saveImgSub.secure_url;
    }
    else sub1 = '';

    if (req.files['image_product_multiple2']) {
        var saveImgSub =  await cloudinary.v2.uploader.upload(req.files['image_product_multiple2'][0].path);
        sub2 = saveImgSub.secure_url;
    }
    else sub2 = '';

    if (req.files['image_product_multiple3']) {
        var saveImgSub =  await cloudinary.v2.uploader.upload(req.files['image_product_multiple3'][0].path);
        sub3 = saveImgSub.secure_url;
    }
    else sub3 = '';
    
   var imgSave = {cover: imgCover, sub1: sub1, sub2: sub2, sub3: sub3};

   var saveToImg = await db.insertImages([productId, imgSave]);

    //save to product variant
    if (arrVariantId != '') {
        arrVariantId.forEach(async variant_id => {
            var savePDV = [productId, variant_id, name, SKU, price, stock];
            var productVariantId = await db.insertProductVariant(savePDV);
            
            if (productVariantId)
                res.redirect('/seller');
            else res.status(500).json({status: 'Thêm thất bại'});
        })
    }
    else {
        //productvariant without variant
        var savePDV = [productId, 1, name, SKU, price, stock];
        var productVariantId = await db.insertProductVariant(savePDV);

        if (productVariantId)
            res.redirect('/seller');
        else res.status(500).json({status: 'Thêm thất bại'});
    }
   }
}

exports.getEditProduct = async (req, res, next) => {
    var productId = req.params.productId;
    var oData = new Array;
    var arrSize = [];
    var arrColor = [];
    var strSize = '';
    var strColor= '';

    const data = await db.getProductVariantInfo([productId]);
    const productInfo = await db.getProductById([productId]);
    const cate1 = await db.getCategoryLevelOne();
    const cate2 = await db.getCategoryLevelTwo([productInfo[0].categorylevel1_id])
    const img = await db.getImages([productId]);
    
    data.forEach(item => {
        oData.push(item.attribute);
    })

    oData.forEach(i => {
        arrSize.push(i.Size);
        arrColor.push(i.Color);
    })
    
    arrColor = [...new Set(arrColor)];
    arrSize = [...new Set(arrSize)];

    arrSize.forEach(i => {
        strSize += i + ',';
    })

    arrColor.forEach(i => {
        strColor += i + ',';
    })
    
    var arrImgSub = [img[0].url.sub1,img[0].url.sub2,img[0].url.sub3];
    
    res.render('./admin/product/editProduct', {
        name: productInfo[0].name,
        category1: cate1,
        category2: cate2,
        cate1: productInfo[0].categorylevel1_id,
        cate2: productInfo[0].categorylevel2_id,
        sku: productInfo[0].sku,
        size: strSize, 
        color: strColor,
        imgCover: img[0].url.cover,
        imgSub: arrImgSub
    }); 
}

exports.postEditProduct = async (req, res, next) => {
    var productId = req.params.productId;
    const {cate1, cate2, material, name, sku, description} = req.body;
    var arrImg = [];

    //check before update
    if (cate1 == '' || cate2 == '' || name == '' || material == '')
        return res.status(500).json();

    const uProduct = [name, cate1, cate2, sku, material, description, productId];
    const update = await db.updateProduct(uProduct);

    //handle img
    const img = await db.getImages([productId]);

    var sub1 = img[0].url.sub1;
    var sub2 = img[0].url.sub2;
    var sub3 = img[0].url.sub3;
    var saveImgCover = img[0].url.cover;

    if (req.files['image_product'])
    {
        const upToCloud =  await cloudinary.v2.uploader.upload(req.files['image_product'][0].path);
        saveImgCover = upToCloud.secure_url;
    }

    if (sub1 != '') {
        if (!req.body.img1)
            sub1 = '';
    }

    if (sub2 != '') {
        if (!req.body.img2)
            sub2 = '';
    }

    if (sub2 != '') {
        if (!req.body.img2)
            sub2 = '';
    }

    if (req.files['image_product_multiple1']) {
        var saveImgSub =  await cloudinary.v2.uploader.upload(req.files['image_product_multiple1'][0].path);
        sub1 = saveImgSub.secure_url;
    }

    if (req.files['image_product_multiple2']) {
        var saveImgSub =  await cloudinary.v2.uploader.upload(req.files['image_product_multiple2'][0].path);
        sub2 = saveImgSub.secure_url;
    }

    if (req.files['image_product_multiple3']) {
        var saveImgSub =  await cloudinary.v2.uploader.upload(req.files['image_product_multiple3'][0].path);
        sub3 = saveImgSub.secure_url;
    }
    
   var imgUpdate = {cover: saveImgCover, sub1: sub1, sub2: sub2, sub3: sub3};

   const updateImg = await db.updateImages([imgUpdate, productId]);
    
    if (update && updateImg) res.redirect('/seller');
    else return res.status(500).json();
}

exports.getEditProductVariant = async (req, res, next) => {
    const productId = req.params.productId;
    const data = await db.getProductVariantInfo([productId]);

    res.render('./admin/inventory/inventoryDetail', {data: data})
}

exports.postEditProductVariant = async (req, res, next) => {
    const {productId, sku, price, stock} = req.body;
    var count = 0;

    for(let i = 0; i < productId.length; i++) {
        if (sku[i] == '--') sku[i] = '';
        var dataUpdate = [sku[i], price[i], stock[i], productId[i]];
        var updateDB = await db.updateProductVariant(dataUpdate);
        if (updateDB == true) count++;
    }

    if (count == productId.length)res.send({ state: 'success' });
    else res.send({ state: 'fail' });
}

exports.postShowProduct = async (req, res, next) => {
    const productId = req.params.productId;

    const data = await db.getProductVariantInfo([productId]);
    var count = 0;
    data.forEach(item => {
       if (item.price <= 1000) 
       count++;
    })

    if (count > 0) {
        return res.send({ state: 0 });  
    }

    if (data[0].status == 1)
        var updateDB = await db.updateProductStatus([0, productId]);
    else var updateDB = await db.updateProductStatus([1, productId]); 

    if (updateDB) res.send({ state: 1});
}

exports.postDeleteProduct = async (req, res, next) => {

    if (!req.body.arrProduct)
        return res.status(500).json();

    const arrProduct = req.body.arrProduct;
    var str = '';
    var arrId = [];
    var arrVariantId = [];
    
    for(let i = 0; i < arrProduct.length + 1; i++) {
       if (i > 0) {
        if (i == arrProduct.length) {
            str+= `$${i}`;
        }
         else str+= `$${i}, `;
       }

        if (i < arrProduct.length) {
            arrId.push(arrProduct[i]);
            var data = await db.getProductVariant([arrProduct[i]]);
            data.forEach(item => {
                arrVariantId.push(item.variant_id);
            })
        }
    }

    var strVar = '';
    var arrVar = [];

    for(let i = 0; i < arrVariantId.length + 1; i++) {
        if (i > 0) {
         if (i == arrVariantId.length) {
            strVar+= `$${i}`;
         }
          else strVar+= `$${i}, `;
        }
 
         if (i < arrVariantId.length) {
             arrVar.push(arrVariantId[i]);
         }
    }

    const deleteProduct = await db.deleteProduct(arrId, str);
    const deleteProductV = await db.deleteProductVariant(arrId, str);
    const deleteProductI = await db.deleteProductIamges(arrId, str);
    const deleteVariantDetail = await db.deleteVariantDetail(arrVar, strVar);

    if (deleteProduct && deleteProductV && deleteProductI && deleteVariantDetail) res.send({ state: 1});
    else res.status(500).json();
}

exports.getSupplier = (req, res, next) => {
    Supplier.find().then((data) => {
        res.render('./admin/supplier/supplier', {data: data});
    })
}

exports.getAddSupplier = (req, res, next) => {
    const message = req.flash("error")[0];
    res.render('./admin/supplier/addSupplier');
}

exports.postAddSupplier = (req, res, next) => {
    var supplier = new Supplier({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        area: req.body.area,
        website: req.body.website,
        employee: req.body.employee,
        description: req.body.description
    });

    supplier.save((err)=>{
        if (err) throw err;

        req.flash('success_msg', 'Đã Thêm Thành Công');
        res.redirect('/admin/supplier/add'); 
    })
}

exports.getEditSupplier = (req, res, next) => {
    var suppId = req.params.suppId;

    Supplier.findById(suppId, function(err, data) {
        if (err) console.log(err);
        else
            res.render('./admin/supplier/editSupplier', {supp: data});
    });
}

exports.postEditSupplier = (req, res, next) => {
    var suppId = req.params.suppId;
    
    Supplier.findById(suppId, function(err, data){
        if (err) console.log(err);
        else {
            data.name = req.body.name;
            data.phone = req.body.phone;
            data.email = req.body.email;
            data.address = req.body.address;
            data.area = req.body.area;
            data.website = req.body.website;
            data.employee = req.body.employee;
            data.description = req.body.description;

            data.save();
            res.redirect('/admin/supplier');
        }
    })
}

exports.getInventory = async (req, res, next) => {
    Product.find().then((data) =>{
        res.render('./admin/inventory/inventory', {data: data});
    });

    // const inv = await Inventory.findById('5fcba110beac431d10a961a0');
    // console.log(inv)
}

exports.getInventoryDetail = (req, res, next) => {
    let productId = req.params.productId;
    var oData = new Array;
    var temp = {};
    var promises = [];
     Product.findById(productId, function(err, data){
        if (err) console.log(err);
        else
        {
           // res.render('./admin/inventory/inventoryDetail', {data: data});
            data.listInventory.forEach((inventory) => {
                promises.push(
                    Inventory.findById(inventory, function(err, inv){
                        if (err) console.log(err);
                        else{
                            temp['size'] = inv.sizeId;
                            temp['color'] = inv.colorId;
                            temp['amount'] = inv.amount;
    
                            data.subId.size.forEach((subSize) => {
                                if (subSize.id === inv.sizeId)
                                {
                                    temp['price'] = subSize.price;
                                }
                            });
    
                            oData.push({'size': inv.sizeId, 'color': inv.colorId, 'investment': inv.investment,'amount': inv.amount, 'price': temp['price']});
                        }
                    })
                )
            })

            Promise.all(promises).then(() => 
            res.render('./admin/inventory/inventoryDetail', {data: data.name, info: oData, productId: productId})
            );
        }
    })
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getdate(tt) {
    var date = new Date(tt);
    var newdate = new Date(date);

    newdate.setDate(newdate.getDate() + 3);
    
    var dd = newdate.getDate();
    var mm = newdate.getMonth() + 1;
    var y = newdate.getFullYear();
    var hour = date.getHours();
    var minutes = date.getMinutes();
   
    var someFormattedDate = dd + '/' + mm + '/' + y + ' ' + hour + 'h' + minutes + 'm';
    return someFormattedDate;
}

exports.getAddInventory = (req, res, next) => {

    var tempData = [1];
    req.session.data = [];
    req.session.token = makeid(10);
    var token = req.session.token;

    Supplier.find().then((supplier) => {
        Category.find().then((data) => {
            res.render('./admin/inventory/addInventory', {data: data, supplier: supplier, inventId: 1, inventInfor: tempData, token: token});
        });
    })
}

exports.postAddInventory = (req, res, next) => {

    var date = req.body.ship_date;
    var supplierId = req.body.supplierId;
    var totalPayment = req.body.pricePayment;
    var totalAmount = req.body.totalAmount;
    var listInventory = req.body.inventoryId;
    var priceImport = req.body.price_input;
    var amountImport = req.body.amount_input;
    var investment = req.body.gia_von;
    var oldPrice = req.body.old_price;
    var detail = new Array;

    // Xử lý để sau khi add thì import vào chứa mảng các product dc select trong inventory
    
    if (listInventory.length > 1)
    {
        for (let i = 0; i < listInventory.length; i++)
        {
            var temp = {};
            temp['inventoryId'] = listInventory[i];
            temp['priceImport'] = priceImport[i];
            temp['amountImport'] = amountImport[i];
            temp['investment'] = investment[i];
            temp['oldPrice'] = oldPrice[i];
            detail.push(temp);
        }
    }
    else{
        var temp = {};
        temp['inventoryId'] = listInventory;
        temp['priceImport'] = priceImport;
        temp['amountImport'] = amountImport;
        temp['investment'] = investment;
        temp['oldPrice'] = oldPrice;
        detail.push(temp);
    }

    var importGoods = new Import({
        supplierId: supplierId,
        date: date,
        totalPayment: totalPayment,
        paymentForm: 'Tiền mặt',
        status: 0,
        amountGoods: totalAmount,
        details: detail
    });

    importGoods.save((err)=>{
        if (err) throw err;

        req.flash('success_msg', 'Đã Thêm Thành Công');
        res.redirect('/admin/inventory/import'); 
    })
}

exports.getBindingInventory = (req, res, next) => {
    var cateId = req.params.cateId;
    var bind = new Array;

    Product.find().then((data) => {
       data.forEach((product) => {
           if (product.productType.main.id === cateId)
           {
                var aColor = new Array;
                var aDetail = new Array;
               product.subId.size[0].color.forEach((gColor) => {
                   aColor.push(gColor.name);
               })
              
               product.subId.size.forEach((getColor) => {
                
                aDetail.push({
                    nameSize: getColor.name,
                    color: aColor
                });
               });
               bind.push({id: product._id, name: product.name, detail: aDetail});
           }
       })
       res.send(JSON.stringify(bind));
    });
}

exports.postSearchInventory = (req, res, next) => {
    var productId = req.body.product;
    var sizeId = req.body.size;
    var colorId = req.body.color;
    var array_id = req.body.array_inventory_id;
    var token = req.body._token;
  
    Product.findById(productId, function(err, data){
        if (err) console.log(err);
        else
            {
                data.subId.size.forEach((sub) => {
                    if (sub.id === sizeId)
                    {
                        sub.color.forEach((subColor) => {
                            if (subColor.id === colorId)
                            {
                                var oData = {
                                    productName: data.name, 
                                    inventoryAmount: subColor.amount,
                                    productSize: sizeId,
                                    productColor: colorId
                                };
                                var a = [];
                                Inventory.find().then((data) => {
                                    data.forEach((ivt) => {
                                        if (ivt.productId === productId)
                                        {
                                            if (ivt.sizeId === sizeId && ivt.colorId === colorId)
                                            {
                                                oData['id'] = ivt._id;
                                                oData['inventoryPrice'] = ivt.investment;
                                                a.push(oData);
                                            }
                                        }
                                    })
                                })
                                
                                if (token != req.session.token )
                                {
                                    req.session.data.push(oData);
                                }
                                    
                                Supplier.find().then((supplier) => {
                                    Category.find().then((data) => {
                                        if (array_id == 1)
                                        {
                                            req.session.token = token;
                                            res.render('./admin/inventory/addInventory', {data: data, supplier: supplier, inventId: 2, inventInfor: a, token: makeid(10)});
                                        }
                                        else
                                        {
                                            req.session.token = token;
                                            res.render('./admin/inventory/addInventory', {data: data, supplier: supplier, inventId: 2, inventInfor: req.session.data, token: makeid(10)});
                                        }
                                    });
                                })
                            }
                        })
                    }
                })
            }
    });
}

exports.getImportInventory = (req, res, next) => {

    Import.find().then((good) => {
        // Category.find().then((data) => {
        //     res.render('./admin/inventory/addInventory', {data: data, supplier: supplier, inventId: 1, inventInfor: tempData, token: token});
        // });
        res.render('./admin/inventory/import', {data: good});
    })
}

exports.getEditImportInventory = (req, res, next) => {
    var importId = req.params.importId;
    var supplier = new Array;
    var oData = new Array;
    var promises = [];

    Import.findById(importId, function(err, data) {
        if (err) console.log(err);
        else
            {
                promises.push(
                    Supplier.findById(data.supplierId, function(err, supp) {
                        if (err) console.log(err);
                        else
                           {
                                supplier.push(supp);
                           }
                    })
                );

                if (data.details.length > 1)
                {
                    
                        data.details.forEach((invent) => {
                            promises.push(
                                Inventory.findById(invent.inventoryId, function(err, inv) {
                                    if (err) console.log(err);
                                    else
                                    {
                                        var temp = {};
                                    // temp['inventoryId'] = invlistInventory;
                                        temp['priceImport'] = invent.priceImport;
                                        temp['amountImport'] = invent.amountImport;
                                        temp['investment'] = invent.investment;
                                        temp['name'] = inv.productName + "( " + inv.sizeId + " - " + inv.colorId + ")";
                                        temp['amount'] = inv.amount;
                                        temp['oldPrice'] = invent.oldPrice;
                                        oData.push(temp);
                                    }
                                })
                            )
                        })
                    
                }

                Promise.all(promises).then(() => 
                    res.render('./admin/inventory/editImport', {info: data, data: oData, supplier: supplier})
                );
            }
    });
}

exports.postEditImportInventory = (req, res, next) => {
    var importId = req.params.importId;
    var promises = [];
    var promises2 = [];

    Import.findById(importId, function(err, imp) {
        if (err) console.log(err);
        else
        {
             imp.status = 1;
             imp.save();
           
            imp.details.forEach((inventory) =>{
                promises.push(
                    Inventory.findById(inventory.inventoryId, function(err, inv) {
                        if (err) console.log(err);
                        else
                        {
                            inv.amount = inventory.amountImport;
                            inv.investment = inventory.investment;
                            inv.save();
            
                            promises2.push(
                                Product.findById(inv.productId, function(err, product) {
                                    if (err) console.log(err);
                                    else
                                    {
                                        // chưa vào db
                                        product.subId.size.forEach(( subSize) => {
                                            if (subSize.id == inv.sizeId)
                                            {
                                            subSize.color.forEach((subColor) => {
                                                if (subColor.id === inv.colorId)
                                                {
                                                    subColor.amount = inventory.amountImport;
                                                    
                                                    product.save();
                                                }
                                            })
                                            }
                                        });
                                    }
                                })
                            )
                        }
                    })
                )
            });

            Promise.all(promises).then(() => 
                Promise.all(promises2).then(() =>
                    res.redirect('/admin/inventory/import')
                )
            );

        }
    });
};

exports.getOrder = (req, res, next) => {
    Order.find().then((order) => {
        res.render("./admin/order/order", {data: order});
    })
}

exports.getOrderDetail = (req, res, next) => {
    var orderId = req.params.orderId;

    Order.findById(orderId, function(err, ord) {
        if (err) console.log(err);
        else
        {
            User.findById(ord.user, function(err, user) {
                if (err) console.log(err);
                else
                {
                    console.log(ord)
                    res.render("./admin/order/orderDetail", {data: ord, userInfo: user});
                }
            });
        }
    });
}

exports.postOrderDetail = (req, res, next) => {
    var orderId = req.params.orderId;

    Order.findById(orderId, function(err, ord) {
        if (err) console.log(err);
        else
        {
            ord.statusToStore = 0;
            ord.status = 2;
            ord.save();
            res.redirect('/admin/order/detail/'+ orderId);
        }
    });
}
exports.getConfirm = (req, res, next) => {
    var orderId = req.params.orderId;

    Order.findById(orderId, function(err, ord) {
        if (err) console.log(err);
        else
        {
            ord.status = 1;
            ord.save();
            res.redirect('/admin/order')
        }
    });
}

exports.getConfirmArrive = (req, res, next) => {
    var orderId = req.params.orderId;

    Order.findById(orderId, function(err, ord) {
        if (err) console.log(err);
        else
        {
            ord.statusToStore = 1;
            ord.statusDelivery = 1;
            ord.save();
            res.redirect('/admin/order/detail/'+ orderId);
        }
    });
}

exports.getShipping = (req, res, next) => {

}

exports.getAddShipping = (req, res, next) => {
    res.render("./admin/shipping/shippingAdd");
}

exports.postAddShipping = (req, res, next) => {
    
}

exports.getReportInventory = (req, res, next) => {
    var amountExport = 0;
    var totalValueExport = 0;
    var promises = [];
    var promises2 = [];
    var iData = [];
    var oData = [];
    var temp = {};
    var tempOut = {};
    var ioData = [];

    promises.push(
        Order.find().then((order) => {
            order.forEach((detail) => {
                detail.cart.forEach((item) => {
                    amountExport = parseInt(amountExport, 10) + parseInt(item.amount, 10);
                    totalValueExport = parseInt(totalValueExport, 10) + parseInt(item.amount, 10) * parseInt(item.price, 10)
                })
            })
        })
    )
    promises.push(
    Product.find().then((product) => {
        product.forEach((prod) => {

            promises2.push( 
                Import.find().then((imp) => {
                    temp['name'] = prod.name;
                    temp['amountImport'] = 0;
                    temp['valueImport'] = 0;
                    imp.forEach((detail) => {
                        
                        detail.details.forEach((info) => {
                            for(let i = 0; i < prod.listInventory.length; i++)
                            {
                                if (info.inventoryId === prod.listInventory[i])
                                {
                                    temp['amountImport'] += info.amountImport;
                                    temp['valueImport'] += info.priceImport * info.amountImport;
                                }
                            }
                        })
                    })
                    iData.push({name: prod.name, amountImport: temp['amountImport'], valueImport: temp['valueImport']});
                }),

                Order.find().then((ord) => {
                    tempOut['name'] = prod.name;
                    tempOut['amountOutport'] = 0;
                    tempOut['valueOutPort'] = 0;
                    ord.forEach((order) => {
                        order.cart.forEach((cart) => {
                            if (cart.productId == prod._id)
                            {
                                tempOut['amountOutport'] = parseInt(tempOut['amountOutport'], 10) + parseInt(cart.amount, 10);
                                tempOut['valueOutPort'] = parseInt(tempOut['valueOutPort'], 10) + parseInt(tempOut['amountOutport'], 10) * parseInt(cart.price, 10);
                            }
                        })
                    })
                    oData.push({name: prod.name, amountOutport: tempOut['amountOutport'], valueOutPort: tempOut['valueOutPort']});
                })
            )
        })
    })
    )
    
    Promise.all(promises).then(() => 
        Promise.all(promises2).then(() =>
        Import.find().then((imp) => {
            iData.forEach((item) => {
                oData.forEach((i) => {
                    if (item.name === i.name)
                    {
                        ioData.push({name: item.name, amountImport: item.amountImport, valueImport: item.valueImport,
                            amountOutport: i.amountOutport, valueOutPort: i.valueOutPort
                        })
                    }
                })
            })
            //console.log(ioData)
            res.render("./admin/report/inventory", {
                data: imp, 
                amountExport: amountExport, 
                totalValueExport: totalValueExport,
                ioData: ioData
            });
        })
        )
    );
}

exports.getReportIncome = (req, res, next) => {
    var amountExport = 0;
    var totalValueExport = 0;
    var promises = [];
    var promises2 = [];
    var oData = [];
    var tempOut = {};
    var ioData = [];

    promises.push(
        Order.find().then((order) => {
            order.forEach((detail) => {
                detail.cart.forEach((item) => {
                    amountExport = parseInt(amountExport, 10) + parseInt(item.amount, 10);
                    totalValueExport = parseInt(totalValueExport, 10) + parseInt(item.amount, 10) * parseInt(item.price, 10)
                })
            })
        })
    )
    promises.push(
    Product.find().then((product) => {
        product.forEach((prod) => {

            promises2.push( 
                Order.find().then((ord) => {
                    tempOut['name'] = prod.name;
                    tempOut['amountOutport'] = 0;
                    tempOut['valueOutPort'] = 0;
                    ord.forEach((order) => {
                        order.cart.forEach((cart) => {
                            if (cart.productId == prod._id)
                            {
                                tempOut['amountOutport'] = parseInt(tempOut['amountOutport'], 10) + parseInt(cart.amount, 10);
                                tempOut['valueOutPort'] = parseInt(tempOut['valueOutPort'], 10) + parseInt(tempOut['amountOutport'], 10) * parseInt(cart.price, 10);
                            }
                        })
                    })
                    oData.push({name: prod.name, amountOutport: tempOut['amountOutport'], valueOutPort: tempOut['valueOutPort']});
                })
            )
        })
    })
    )
    
    Promise.all(promises).then(() => 
        Promise.all(promises2).then(() =>
        res.render("./admin/report/income", { 
            amountExport: amountExport, 
            totalValueExport: totalValueExport,
            oData: oData
        })
        )
    );
}
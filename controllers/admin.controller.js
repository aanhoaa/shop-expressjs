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

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null,Date.now() + '-' + file.originalname)
    }
})

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

exports.getHome = (req, res, next) => {
    Product.find().then((data) =>{
        res.render('./admin/index', {data: data, user: req.user});
    })
}

exports.getCategory = (req, res, next) => {
    
    Category.find().then((data) =>{
        res.render('./admin/category/category', {data: data});
    })
}

exports.getAddCategory = (req, res, next) => {
    const message = req.flash("error")[0];
    Category.find().then((data)=>{
        res.render('./admin/category/addCategory', {data: data,  message: `${message}`});
    })
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

exports.getAddProduct = (req, res, next) => {
    let parentCate = [];
    let material = [];
    let brand = [];

    Category.find({}, (err, cats) => {
        cats.forEach(cat => {
            parentCate.push({name: cat.name, id: cat._id});
        });
    });

    Material.find({}, (err, mates) => {
        mates.forEach(mate => {
            material.push({name: mate.name, id: mate._id});
        });
    });

    Brand.find({}, (err, brds) => {
        brds.forEach(brd => {
            brand.push({name: brd.name, id: brd._id});
        });
    });
    
    Category.find().then(data=>{
        res.render('./admin/product/addProduct', {parentCate: parentCate, material: material, brand: brand});
    })
}

exports.getBindingCategory = (req, res, next) => {
    var parentId = req.params.parentId;
    var bind = new Array;

    Category.findById(parentId, function(err, data){
        if (err) console.log(err);
        else {
              data.childCateName.forEach((item)=>{
                bind.push({id: item._id, name: item.childName});
            })
        }

        res.send(JSON.stringify(bind));
    })
}

exports.postAddProduct = (req, res, next) => {
    var parentId = req.body.parentCate;
    var childId = req.body.childCate;
    var parentCateName = '';
    var childCateName = '';
    var countInventory = 0;
    var arrayInventory = new Array;

    Category.findById(parentId, function(err, data){
        if (err) console.log(err);
        else {
            data.childCateName.forEach((item)=>{
                if (item._id == childId)
                {
                    childCateName = item.childName;
                    parentCateName = data.name;
                }
            })
        }

        var product = new Product({
            stock: 0,
            price: 0,
            name: req.body.name,
            color: req.body.color,
            size: req.body.size,
            materials: req.body.material,
            brand: req.body.brand,
            productType: {
                main: {
                    id: parentId,
                    name: parentCateName
                },
                sub: {
                    id: childId,
                    name: childCateName
                }
            },
            images: req.files['image_product'][0].filename,
            subImages: [
                req.files['image_product_multiple1'][0].filename,
                req.files['image_product_multiple2'][0].filename,
                req.files['image_product_multiple3'][0].filename,
            ]
        });
        
        var size = Array, color = Array;
        size = req.body.size;
        color = req.body.color;
        countInventory = size.length * color.length;

        size.forEach((listSize) => {
            var obj = {};
            obj['id'] = listSize;
            obj['name'] = listSize;
            obj['price'] = 0;
            product.subId.size.push(obj);
        })

        color.forEach((listColor) => {
            product.subId.size.forEach((list)=>{
                var obj = {};
                obj['id'] = listColor;
                obj['name'] = listColor;
                obj['amount'] = 0;
                list.color.push(obj);
            })
        })
        
        product.save((err)=>{
            if (err) throw err;
        });

        size.forEach((listSize) => {
            color.forEach((listColor) => {
                var inventory = new Inventory({
                    productId: product._id,
                    productName: product.name,
                    sizeId: listSize,
                    colorId: listColor,
                    amount: 0,
                    investment: 0
                });

                countInventory--;
                inventory.save((err)=>{
                    if (err) throw err;
                })

                arrayInventory.push(inventory._id);
            });
        });

        if (countInventory === 0)
        {
            product.listInventory = arrayInventory;
            product.save();

            req.flash('success_msg', 'Đã Thêm Thành Công');
            res.redirect('/admin/product/add'); 
        }
    })
}

exports.getEditProduct = (req, res, next) => {
    var productId = req.params.productId;
    let parentCate = [];
    let material = [];
    let brand = [];
    let subCate = [];

    Category.find({}, (err, cats) => {
        cats.forEach(cat => {
            parentCate.push({name: cat.name, id: cat._id});
        });
    });

    Material.find({}, (err, mates) => {
        mates.forEach(mate => {
            material.push({name: mate.name, id: mate._id});
        });
    });

    Brand.find({}, (err, brds) => {
        brds.forEach(brd => {
            brand.push({name: brd.name, id: brd._id});
        });
    });

    Product.findById(productId, function(err, data) {
        if (err) console.log(err);
        else
        {
            Category.findById(data.productType.main.id, function(err, cat) {
                if (err) console.log(err);
                else
                {
                    cat.childCateName.forEach((sub) => {
                        subCate.push({name: sub.childName, id: sub._id});
                    });
                    
                    res.render('./admin/product/editProduct', {data: data, parentCate: parentCate, brand : brand, material: material, subCate: subCate}); 
                }
            });
        }
    });
}

exports.postEditProduct = (req, res, next) => {
    var productId = req.params.productId;

    Product.findById(productId, function(err, data) {
        if (err) console.log(err);
        else
        {
            data.name = req.body.name;
            data.materials = req.body.material;
            data.brand = req.body.brand;

            if (req.files['image_product'])
            {
                data.images = req.files['image_product'][0].filename;
            }

            if (req.files['image_product_multiple1'])
            {
                data.subImages.shift();
                data.subImages[0] = req.files['image_product_multiple1'][0].filename;
            }

            if (req.files['image_product_multiple2'])
            {
                data.subImages.splice(1,1)
                data.subImages[1] = req.files['image_product_multiple2'][0].filename;
            }

            if (req.files['image_product_multiple3'])
            {
                data.subImages.splice(2,1);
                data.subImages[2] = req.files['image_product_multiple3'][0].filename;
            }

            // data.subImages = [
            //     req.files['image_product_multiple1'][0].filename,
            //     req.files['image_product_multiple2'][0].filename,
            //     req.files['image_product_multiple3'][0].filename,
            // ]
        
            // get ra so sánh 3 cái image thử
            //data.subImages[0] = '1607335670751-cute.png';
            data.save();
            res.redirect('/admin');
            
           
        }
    });
   // console.log(req.body.brand)
}

exports.postSetPrice = (req, res, next) => {
    var productId = req.body.productId;
    var price = req.body.price;
    var size = req.body.size;
    var color = req.body.color;

    Product.findById(productId, function(err, data) {
        if (err) console.log(err);
        else
        {
            data.subId.size.forEach((subSize) => {
                if (subSize.name === size)
                {
                    subSize.price = price;
                    data.price = price;
                    data.save();
                    res.contentType('json');
                    res.send({ state: 'success' });
                }
            });
        }
    });

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
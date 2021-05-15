const db = require('../config/configDB');
const bcrypt = require('bcrypt');

/*
GLOBAL
*/
function checkById(table, value) {
    const sql = `SELECT * FROM ${table} WHERE id= $1`;
    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rows[0])
            return true;
        else return false;
    })
    .catch(e => {
        console.log('err', e);
        return false;
    });
}

function checkName(table, values) {
    const sql = `SELECT * FROM ${table} WHERE name= $1`;
    return db.simpleQuery(sql, values)
    .then(res => {
        if (res.rows[0])
            return true;
        else return false;
    })
    .catch(e => {
        console.log('err', e);
        return false;
    });
}

function getVariantId(values) {
    const sql = 'SELECT id FROM variantdetail WHERE color_id=$1 AND size_id=$2';
    
    return db.simpleQuery(sql, values)
    .then(res => {
        return res.rows[0].id;
    })
    .catch(e => {
        console.log('err', e);
        return false;
    });
}

function getList(table, value) {
    var sql = '';
    var column = '';

    if (value)
        {
            switch(table) {
                case 'categorychildren':
                    column = 'categoryparents_id';
                    break;
                case 'importgooddetail':
                    column = 'importgood_id';
                    break;
            } 

            sql =  `SELECT * FROM ${table} WHERE ${column}=${value[0]}`;
        }
    else  sql =  `SELECT * FROM ${table}`;

    return db.simpleQuery(sql)
    .then(res => {
        return res.rows;
    })
    .catch(e => {
        console.log('err', e);
        return false;
    });
}

function nameUpdate(table, values) {
    const sql = `UPDATE ${table} SET name= $2, description = $3 WHERE id = $1`;

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return 'update success!!!';
        return 'false';
    })
    .catch(error => {return error;});
}

function updateOne(table, column, value) {
    const sql = `UPDATE ${table} SET ${column}=$2 WHERE id = $1`;
    // bị lỗi import thì check đây
    //const sql = `UPDATE ${table} SET ${column}=$2 WHERE id = $1 RETURNING status`; 

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res;
        return 'false';
    })
    .catch(error => {return error;});
}

function getOne(table, column, values) {
    const sql = `SELECT * FROM ${table} WHERE ${column}=$1 RETURNING $2`;

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res;
        return false;
    })
    .catch(error => {return error;});
}

function getAll(table, column, value) {
    const sql = `SELECT * FROM ${table} WHERE ${column}=$1`;

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res;
        return false;
    })
    .catch(error => {return error;});
}
/*
admin
*/
function checkAdminExist(value) {
    const sql = 'SELECT * FROM admin WHERE username=$1';

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rows[0])
            return true;
        else return false;
    })
    .catch(error => {return error;});
}
function insertAdmin(values) {
    const sql = 'INSERT INTO admin(username, password, email) VALUES($1, $2, $3)';
    
    return checkAdminExist([values[0]])
    .then(data => {
        if (!data) {
            values[1] =  bcrypt.hashSync(values[1], 10);
            return db.excuteQuery(sql, values)
            .then(res => {
                if (res.rowCount > 0)
                    return true;
                return false;
            })
            .catch(error => {return error;});
        }
        else {
            return ({
                type: 0,
                message: "user exist"
            })
        }
    })
}
/*=====================================*/ 

/*
user
*/
function checkEmailExist(value) {
    const sql = 'SELECT * FROM users WHERE email = $1';

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rows[0])
            return true;
        else return false;
    })
    .catch(error => { return false;}); 
}

function checkUserExist(table, value) {
    switch (table) {
        case 1: {
            table = 'admin';
            break;
        }
        case 2: {
            table = 'users';
            break;
        }
        case 3: {
            table = 'shop';
            break;
        }
    }
    
    const sql = `SELECT * FROM  ${table} WHERE username = $1`;

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rows[0])
            return true;
        else return false;
    })
    .catch(error => { return false;}); 
}

function checkUserById(value) {
    const sql = 'SELECT * FROM sinhvien WHERE id= $1';
    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rows[0])
            return true;
        else return false;
    })
    .catch(e => {
        console.log('err', e);
        return false;
    });
}

function updateIsverified(values) {
    return updateOne('users', 'isverified', [values, 1])
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
} //1-id -2 value of veri

function getUserInfo(table, value) {
    switch (table) {
        case 1: {
            table = 'admin';
            break;
        }
        case 2: {
            table = 'users';
            break;
        }
        case 3: {
            table = 'shop';
            break;
        }
    }

    return getAll(`${table}`, 'username', value)
    .then(res => {
        //console.log('res', res.rows[0])
        return res.rows[0];
    })
    .catch(error => {return error;});
}

function userInsert(values) {
    const sql = 'INSERT INTO users(username, password, email, tokenconfirm) VALUES($1, $2, $3, $4)';
    
    return checkUserExist(2, [values[0]])
    .then(data => {
        if (!data) {
            values[1] =  bcrypt.hashSync(values[1], 10);
            return db.excuteQuery(sql, values)
            .then(res => {
                if (res.rowCount > 0)
                    return true;
                return false;
            })
            .catch(error => {return error;});
        }
        else {
            return ({
                type: 0,
                message: "user exist"
            })
        }
    })
}

function userUpdate(values) {
    const sql = 'UPDATE sinhvien SET email= $2 WHERE id = $1';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return 'update success!!!';
        return 'false';
    })
    .catch(error => {return error;});
}

function userDelete(value) {
    const sql = 'DELETE FROM sinhvien WHERE id = $1';

    return checkUserById(value).
    then(data => {
        if (data) {
            return db.excuteQuery(sql, value)
            .then(res => {
                if (res.rowCount > 0)
                    return 'user deleted';
                return 'false';
            })
            .catch(error => {return error;});
        }
        else {
            return ({
               // type: TYPE,
                message: "user not exist"
            })
        }
    })
}

function insertCart(values) {
    const sql = 'INSERT INTO cart(user_id, productvariant_id, amount) VALUES ($1, $2, $3)';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

/*
 <==========================================================================>
*/

/*
    helper category
*/

function checkCateName(value) {
    const sql = 'SELECT * FROM categoryparents WHERE name= $1';
    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rows[0])
            return true;
        else return false;
    })
    .catch(e => {
        console.log('err:', e);
        return false;
    });
}

function cateInsert(values) {
    const sql = 'INSERT INTO categorylevel1(name, description) VALUES($1, $2)';
    
    return checkCateName([values[0]])
    .then(data => {
        if (!data) {
            return db.excuteQuery(sql, values)
            .then(res => {
                if (res.rowCount > 0)
                    return 'Add category success!!!';
                return 'false';
            })
            .catch(error => {return error;});
        }
        else {
            return ({
               // type: TYPE,
                message: "category exist"
            })
        }
    })
}

function parentCateUpdate(values) {
    return nameUpdate('categorylevel1', values);
}

function childCateUpdate(values) {
    return nameUpdate('categorychildren', values);
}

function cateDelete(value) {
    const sql = 'DELETE FROM categorylevel1 WHERE id = $1';

    return checkById('categoryparents', value).
    then(data => {
        if (data) {
            return db.excuteQuery(sql, value)
            .then(res => {
                if (res.rowCount > 0)
                    return 'rows deleted';
                return 'false';
            })
            .catch(error => {return error;});
        }
        else {
            return ({
               // type: TYPE,
                message: "rows not exist"
            })
        }
    })
}

function getListCateParents() {
    return getList('categoryparents')
    .then(data => {
        return data;
    })
    .catch(error => {return error;});
}

function getListCateChildren(value) {
    return getList('categorychildren', value)
    .then(data => {
        return data;
    })
    .catch(error => {return error;});
}

function childCateInsert(values) {
    const sql = 'INSERT INTO categorychildren(categoryparents_id, name, description) VALUES($1, $2, $3)';

    return checkById('categoryparents', [values[0]])
    .then(data => {
        if (data) {
            return db.excuteQuery(sql, values)
            .then(res => {
                if (res.rowCount > 0)
                    return 'Add category child success!!!';
                return 'false';
            })
            .catch(error => {return error;});
        }
        else {
            return ({
               // type: TYPE,
                message: "category not exist"
            })
        }
    })
}

function insertCateLevel(table, value) {
    var cateId = '';
    switch(table) {
        case 2: {
            table = 'categorylevel2';
            cateId = 'categorylevel1_id';
        }
        case 3: {
            table = 'categorylevel3';
            cateId = 'categorylevel2_id';
        }
    }

    const sql = `INSERT INTO ${table} (${cateId}, name, description) VALUES($1, $2, $3)`;

    return checkById(table, [value[0]])
    .then(data => {
        if (!data) {
            return db.excuteQuery(sql, value)
            .then(res => {
                if (res.rowCount > 0)
                    return 'Add category child success!!!';
                return 'false';
            })
            .catch(error => {return error;});
        }
        else {
            return ({
               // type: TYPE,
                message: "category not exist"
            })
        }
    })
}

function getCategoryLevelOne() {
    const sql = 'SELECT id, name FROM categorylevel1';

    return db.simpleQuery(sql)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function getCategoryLevelTwo(value) {
    const sql = 'SELECT id, name FROM categorylevel2 WHERE categorylevel1_id = $1';

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function getCategoryLevelThree(value) {
    const sql = 'SELECT id, name FROM categorylevel3 WHERE categorylevel2_id = $1';

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows[0];
        return false;
    })
    .catch(error => {return error;});
}

/*
 <==========================================================================>
*/

/*
    product helper
*/

function insertProduct(values) {
    const sql = 'INSERT INTO product(categorylevel1_id, categorylevel2_id, shop_id, name, description, status, material, sku)'
    + 'VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows[0].id;
        return false;
    })
}

function insertProductVariant(values) {
    const sql = 'INSERT INTO productvariant(product_id, variant_id, name, sku, price, stockamount) VALUES($1, $2, $3, $4, $5, $6) RETURNING id';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows[0].id;
        return false;
    })
    .catch(error => {return error;});
}

function getIdVarianProduct(value) {
    const sql = 'SELECT id FROM productvariant WHERE name=$1';

    return checkName('productvariant', [value[0].trim()])
    .then(data => {
        if (data) {
            return db.simpleQuery(sql, value)
            .then(res => {
                return res.rows[0].id;
            })
            .catch(error => {return error;});
        }
        else {
            return ({
               // type: TYPE,
                message: "product variant not exist"
            })
        }
    })
}

//table imgs
function insertImages(values) {
    const sql = 'INSERT INTO images(product_id, url) VALUES($1, $2)';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(e => {
        console.log('err', e);
        return false;
    });
}

function updateImages(values) {
    const sql = 'UPDATE images SET url = $1 WHERE product_id = $2';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(e => {
        console.log('err', e);
        return false;
    });
}

function getImages(value) {
    const sql = 'SELECT url FROM images WHERE product_id = $1';

    return db.simpleQuery(sql, value)
    .then( res =>  {
        if (res.rowCount > 0)
        {
            return res.rows;
        }
        return false;
    })
    .catch(error => { return false;}); 
}

//variant detail
function insertVariantDetail(value) {
    const sql = 'INSERT INTO variantdetail(attribute) VALUES($1) RETURNING id';

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            {
                return res.rows[0].id;
            }
        return false;
    })
    .catch(error => {return error;}); 
}

// product variant detail
function insertProductVariantDetail(values) {
    const sql = 'INSERT INTO productvariantdetail(productvariant_id, variantdetail_id) VALUES($1, $2)';
    let val = [values[0]];

    return insertVariantDetail([values[1]])
    .then(data => {
        val.push(data);
        return db.excuteQuery(sql, val)
        .then( res =>  {
            if (res.rowCount > 0)
            {
                return true;
            }
            return false;
        })
        .catch(error => {return error;}); 
    })
}

function insertImportGood(values) {
    const sql = 'INSERT INTO importgood(supplier_id, paymentForm, deleveryDate, totalPrice, status) VALUES($1, $2, $3, $4, $5) RETURNING id';

    return db.excuteQuery(sql, values)
        .then( res =>  {
           if (res.rows[0].id)
            return res.rows[0].id;
            else return false;
        })
        .catch(error => {return error;});  
}

function insertImportGoodDetail(values) {
    const sql = 'INSERT INTO importgooddetail(productvariant_id, importgood_id, amount, priceimport, status) VALUES($1, $2, $3, $4, $5)';

    return db.excuteQuery(sql, values)
    .then( res =>  {
        if (res.rowCount > 0)
        {
            return true;
        }
        return false;
    })
    .catch(error => { return false;});  
}

function getDataImportGoodDetail(value) {
    const sql = "SELECT * FROM importgood WHERE id=$1";

    return db.simpleQuery(sql, value)
    .then(data => {
        if (data.rowCount > 0)
        {
            return data.rows[0];
        }
    })
    .catch(error => {return error;});
}

function getListImportGood() {
    return getList('importgood')
    .then(data => {
        return data;
    })
    .catch(error => {return error;});
}

function getListImportGoodDetail(value) {
    return getList('importgooddetail', value)
    .then(data => {
        return data;
    })
    .catch(error => {return error;});
}

function confirmInsertImportGood(value) {
    const sql = 'UPDATE importgooddetail set status = 1 FROM importgood WHERE  importgooddetail.importgood_id = $1 RETURNING productvariant_id, amount, priceimport ';
  
    return updateOne('importgood', 'status', value)
    .then(data => {
        if (data.rows[0].status == 1)
        {
            return db.excuteQuery(sql, [value[0]])
            .then( res =>  {
                if (res.rowCount > 0)
                {
                    return res.rows;
                }
                return false;
            })
            .catch(error => { return false;});  
        }
    })
  .catch(error => {return error;});
} 

function updateProductVariant(values) {
    const sql = 'UPDATE productvariant set sku = $1, price = $2, stockamount = $3 WHERE id=$4';

    return db.excuteQuery(sql, values)
    .then( res =>  {
        if (res.rowCount > 0)
        {
            return true;
        }
        return false;
    })
    .catch(error => { return false;});  
}

function getProductById(value) {
    const sql = 'SELECT * FROM product WHERE id = $1';

    return db.simpleQuery(sql, value)
    .then( res =>  {
        if (res.rowCount > 0)
        {
            return res.rows;
        }
        return false;
    })
    .catch(error => { return false;});  
}

function getProductByShop(value) {
    const sql = 'SELECT * FROM product WHERE shop_id = $1';

    return db.simpleQuery(sql, value)
    .then( res =>  {
        if (res.rowCount > 0)
        {
            return res.rows;
        }
        return false;
    })
    .catch(error => { return false;});  
}

function getProductVariant(value) {
    const sql = 'SELECT * FROM productvariant WHERE product_id = $1';

    return db.simpleQuery(sql, value)
    .then( res =>  {
        if (res.rowCount > 0)
        {
            return res.rows;
        }
        return false;
    })
    .catch(error => { return false;});  
}

function getProductVariantInfo(value) {
    const sql = 'select a.name, c.attribute, b.sku, b.price, b.stockamount, b.id from productvariant as b inner join product as a on b.product_id = a.id inner join variantdetail as c on c.id = b.variant_id where a.id = $1';

    return db.simpleQuery(sql, value)
    .then( res =>  {
        if (res.rowCount > 0)
        {
            return res.rows;
        }
        return false;
    })
    .catch(error => { return false;}); 
}

function updateProduct(values) {
    const sql = 'UPDATE product SET name = $1, categorylevel1_id = $2, categorylevel2_id = $3, sku = $4, material = $5, description = $6 Where id = $7';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
        {
            return true;
        }
        return false;
    })
    .catch(error => { return false;}); 
}

/*
 <==========================================================================>
*/
/*
currency
*/
function insertBillSlip(values) {
    const sql = 'INSERT INTO billslip(import_id, billslipdate, totalprice, paymentform, typebill, note) VALUES($1, $2, $3, $4, $5, $6)';

    return db.excuteQuery(sql, values)
    .then(data => {
        if (res.rowCount > 0)
        {
            return true;
        }
        return false;
    })
    .catch(error => { return false;}); 
}

/*
 <==========================================================================>
*/

/*
supplier
*/
function insertSupplier(values) {
    const sql = 'INSERT INTO supplier(name, phone, address, email, note) VALUES($1, $2, $3, $4, $5)';
 
    return checkName('supplier', [values[0].trim()])
    .then(data => {
        if (!data) {
            return db.excuteQuery(sql, values)
            .then( res =>  {
                if (res.rowCount > 0)
                {
                    return 'Add supplier success';
                }
                return false;
            })
            .catch(error => {return error;}); 
        }
        else {
            return ({
               // type: TYPE,
                message: "supplier exist"
            })
        } 
    })
    .catch(error => {return error;});
}

/*
 <==========================================================================>
*/

/*
    ORDER
*/
function insertOrderTotal(values) {
    const sql = 'INSERT INTO ordertotal(user_id, payment_id, datepurchase) VALUES ($1, $2, $3) RETURNING id';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
        {
            return res.rows[0].id;
        }
        return false;
    })
    .catch(error => {return error;});
}

function insertOrder(values) {
    const sql = 'INSERT INTO order(ordertotal_id, shop_id, shippingfee, deleverytime, status) VALUES ($1, $2, $3) RETURNING id';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
        {
            return res.rows[0].id;
        }
        return false;
    })
    .catch(error => {return error;});
}
/*
 <==========================================================================>
*/

module.exports = {
    insertAdmin,

    checkEmailExist,
    checkUserExist,
    getUserInfo,
    userInsert,
    userUpdate,
    userDelete,
    updateIsverified,
    insertCart,

    cateInsert,
    parentCateUpdate,
    cateDelete,
    getListCateParents,
    getListCateChildren,
    childCateInsert,
    childCateUpdate,
    insertCateLevel,
    
    getCategoryLevelOne,
    getCategoryLevelTwo,
    getCategoryLevelThree,

    insertProduct,
    insertProductVariant,
    updateProduct,
    updateProductVariant,
    getProductById,
    getProductByShop,
    getProductVariant,
    getProductVariantInfo,

    insertImportGood,
    getDataImportGoodDetail,
    insertImportGoodDetail,
    getListImportGood,
    getListImportGoodDetail,
    confirmInsertImportGood,
    insertBillSlip,
    insertProductVariantDetail,

    insertImages,
    updateImages,
    getImages,
    insertVariantDetail,

    insertSupplier,

    insertOrderTotal,
    insertOrder,
}
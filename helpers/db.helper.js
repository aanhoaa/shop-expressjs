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
    .catch(error => { console.log('error:',error)}); 
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

function updateUserIsverified(values) {
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
        if (res.rowCount > 0)
            return res.rows[0];
        return false;
    })
    .catch(error => {return error;});
}

function insertUser(values) {
    const sql = 'INSERT INTO users(fullname, username, password, email, tokenconfirm) VALUES($1, $2, $3, $4, $5) RETURNING id';
    
    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
        return res.rows[0].id;
        return false;
    })
    .catch(error => {return error;});
}

function updateUserProfile(values) {
    const sql = 'UPDATE users SET fullname = $2, email = $3, phone = $4, gender = $5, birthday = $6 WHERE id = $1';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function updateUserPassword(values) {
    const sql = 'UPDATE users SET password = $2 WHERE id = $1 RETURNING password'

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows[0].password;
        return false;
    })
    .catch(error => {return error;});
}

function updateUserPasswordByEmail(values) {
    const sql = 'UPDATE users SET password = $2 WHERE email = $1'

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
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

function updateUserVerify(value) {
    const sql = 'UPDATE users SET isverified = $1';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function insertUserIdentityDetail(value) {
    const sql = 'INSERT INTO identitydetail(name) VALUES ($1) RETURNING id';

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows[0].id;
        return false;
    })
    .catch(error => {return error;});
}

function insertUserWard(values) {
    const sql = 'INSERT INTO ward(identity_id, code, name) VALUES ($1, $2, $3) RETURNING id';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows[0].id;
        return false;
    })
    .catch(error => {return error;});
}

function insertUserDistrict(values) {
    const sql = 'INSERT INTO district(ward_id, code, name) VALUES ($1, $2, $3) RETURNING id';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows[0].id;
        return false;
    })
    .catch(error => {return error;});
}

function insertUserProvince(values) {
    const sql = 'INSERT INTO province(district_id, code, name) VALUES ($1, $2, $3) RETURNING id';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows[0].id;
        return false;
    })
    .catch(error => {return error;});
}

function insertUserAddressBook(values) {
    const sql = 'INSERT INTO addressbook(user_id, province_id, fullname, phone, isdefault) VALUES ($1, $2, $3, $4, $5)';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function getUserAddressBookExist(value) {
    const sql = 'SELECT * FROM addressbook WHERE user_id = $1';

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

function getUserAddressBook(value) {
    const sql = 'select a.fullname, a.phone, a.isdefault, a.id as book_id, b.code as province_code, c.code as district_code, d.code as ward_code, e.name as identity_name, b.name as province_name, c.name as district_name, d.name as ward_name, e.id as identity_id from addressbook as a inner join province as b on b.id = a.province_id inner join district as c on c.id = b.district_id inner join ward as d on d.id = c.ward_id inner join identitydetail as e on e.id = d.identity_id where user_id = $1 ORDER BY a.isdefault DESC';

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function getAddressBookById(value) {
    const sql = 'select a.fullname, a.phone, a.id as book_id, b.code as province_code, c.code as district_code, d.code as ward_code, e.name as identity_name, b.name as province_name, c.name as district_name, d.name as ward_name, e.id as identity_id, b.id as province_id, c.id as district_id, d.id as ward_id from addressbook as a inner join province as b on b.id = a.province_id inner join district as c on c.id = b.district_id inner join ward as d on d.id = c.ward_id inner join identitydetail as e on e.id = d.identity_id where a.id = $1';

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function updateUserAdressBook(values) {
    const sql = 'UPDATE addressbook SET fullname = $2, phone = $3 WHERE id = $1'

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function updateUserProvince(values) {
    const sql = 'UPDATE province SET code = $2, name = $3 WHERE id = $1';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function updateUserDistrict(values) {
    const sql = 'UPDATE district SET code = $2, name = $3 WHERE id = $1';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function updateUserWard(values) {
    const sql = 'UPDATE ward SET code = $2, name = $3 WHERE id = $1';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function updateUserIdentity(values) {
    const sql = 'UPDATE identitydetail SET name = $2 WHERE id = $1';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function updateUserAddressBookDefault(values) {
    const sql = 'UPDATE addressbook SET isdefault = $2 WHERE id = $1';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function deleteUserAddressBook(value) {
    const sql = 'DELETE from addressbook WHERE id = $1';

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function deleteUserProvince(value) {
    const sql = 'DELETE from province WHERE id = $1';

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function deleteUserDistrict(value) {
    const sql = 'DELETE from district WHERE id = $1';

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function deleteUserWard(value) {
    const sql = 'DELETE from ward WHERE id = $1';

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function deleteUserIdentityDetail(value) {
    const sql = 'DELETE from identitydetail WHERE id = $1';

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
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

function checkCateName(value, level) {
    var category = '';
    switch(level) {
        case 1:
            category = 'categorylevel1';
            break;
        case 2:
            category = 'categorylevel2';
            break;
    }

    const sql = `SELECT * FROM ${category} WHERE name= $1`;

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

function insertCategoryLevelOne(values, level) {
    const sql = 'INSERT INTO categorylevel1(name, description) VALUES($1, $2)';
    
    return checkCateName([values[0]], 1)
    .then(data => {
        if (!data) {
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
               status: 0,
               message: "category exist"
            })
        }
    })
}

function insertCategoryLevelTwo(values) {
    const sql = 'INSERT INTO categorylevel2(categorylevel1_id, name, description) VALUES($1, $2, $3)';
    
    return checkCateName([values[1]], 2)
    .then(data => {
        if (!data) {
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
               status: 0,
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
    const sql = 'INSERT INTO productvariant(product_id, variant_id, name, sku, price, stockamount) VALUES($1, $2, $3, $4, $5, $6)';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
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

function deleteProduct(value, str) {
    const sql = `DELETE FROM product WHERE id in (${str});`

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function deleteProductVariant(value, str) {
    const sql = `DELETE FROM productvariant WHERE product_id in (${str});`

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function deleteProductIamges(value, str) {
    const sql = `DELETE FROM images WHERE product_id in (${str});`

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function deleteVariantDetail(value, str) {
    const sql = `DELETE FROM variantdetail WHERE id in (${str});`

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function deleteTest(value, str) {
    const sql = `delete from color where id in (${str})`;

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
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

function getProduct() {
    const sql = 'SELECT * FROM product';

    return db.simpleQuery(sql)
    .then( res =>  {
        if (res.rowCount > 0)
        {
            return res.rows;
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
    const sql = 'select a.name, a.status, c.attribute, b.sku, b.price, b.stockamount, b.id, d.url, e.name from productvariant as b inner join product as a on b.product_id = a.id inner join variantdetail as c on c.id = b.variant_id inner join images as d on d.product_id = a.id inner join shop as e on a.shop_id = e.id where a.id = $1';

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
    const sql = 'UPDATE product SET name = $1, categorylevel1_id = $2, categorylevel2_id = $3, sku = $4, material = $5, description = $6 WHERE id = $7';

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

function updateProductStatus(value) {
    const sql = 'UPDATE product SET status = $1 WHERE id = $2';

    return db.excuteQuery(sql, value)
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
    VIOLATE
*/

function getViolateType() {
    const sql = 'SELECT * FROM violatetype';
   
    return db.simpleQuery(sql)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function getProductViolate(value) {
    const sql = 'select a.id, b.id as violatetype_id, c.id as violateinfo_id, b.name, c.reason, c.suggestion, a.updated_at from productviolate as a inner join violatetype as b on b.id = a.violatetype_id inner join violateinfo as c on c.id = a.violateinfo_id where a.product_id = $1';

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

function insertViolataInfo(values) {
    const sql = 'INSERT INTO violateinfo(reason, suggestion) VALUES ($1, $2) RETURNING id';

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

function insertProductViolate(values) {
    const sql = 'INSERT INTO productviolate(product_id, violateinfo_id, violatetype_id) VALUES ($1, $2, $3)';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
        {
            return true;
        }
        return false;
    })
    .catch(error => {return error;});
}

function checkProductViolateExist(value) {
    const sql = 'SELECT * FROM productviolate WHERE product_id = $1';

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rows[0])
            return true;
        else return false;
    })
    .catch(error => {return error;});
}

function deleteProductViolate(value) {
    const sql = 'DELETE FROM productviolate WHERE product_id = $1';

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
        {
            return true;
        }
        return false;
    })
    .catch(error => {return error;});
}

function deleteViolateInfo(value) {
    const sql = 'DELETE FROM violateinfo WHERE id = $1';

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
        {
            return true;
        }
        return false;
    })
    .catch(error => {return error;});
}

function deleteViolateType(value) {
    const sql = 'DELETE FROM violatetype WHERE id = $1';

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
        {
            return true;
        }
        return false;
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
    insertUser,
    updateUserProfile,
    updateUserPassword,
    updateUserPasswordByEmail,
    userDelete,
    updateUserIsverified,
    insertUserIdentityDetail,
    insertUserWard,
    insertUserDistrict,
    insertUserProvince,
    insertUserAddressBook,
    getUserAddressBookExist,
    getUserAddressBook,
    getAddressBookById,
    updateUserAdressBook,
    updateUserProvince,
    updateUserDistrict,
    updateUserWard,
    updateUserIdentity,
    updateUserAddressBookDefault,
    deleteUserAddressBook,
    deleteUserProvince,
    deleteUserDistrict,
    deleteUserWard,
    deleteUserIdentityDetail,
    insertCart,

    insertCategoryLevelOne,
    insertCategoryLevelTwo,
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
    updateProductStatus,
    getProduct,
    getProductById,
    getProductByShop,
    getProductVariant,
    getProductVariantInfo,
    deleteProduct,
    deleteProductVariant,
    deleteProductIamges,
    deleteVariantDetail,

    getViolateType,
    getProductViolate,
    insertViolataInfo,
    insertProductViolate,
    checkProductViolateExist,
    deleteProductViolate,
    deleteViolateInfo,
    deleteViolateType,

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
    deleteTest
}
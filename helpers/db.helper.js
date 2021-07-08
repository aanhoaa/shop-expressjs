const db = require('../config/configDB');
const bcrypt = require('bcryptjs');

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

function nameUpdate(type, values) {
    var table = type == 1 ? 'categorylevel1' : 'categorylevel2';
    const sql = `UPDATE ${table} SET name= $2, description = $3 WHERE id = $1`;

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
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

function getProductBySearch(value) {
    const sql = `select id, name from product where name @@ plainto_tsquery($1) and status = 1`;

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function getProductInfoByID(value) {
    const sql = "select  a.id, a.name, b.max_price, b.min_price, c.url->'cover' as cover from product a inner join (select max(price) as max_price, min(price) as min_price, product_id from productvariant group by product_id) b on a.id = b.product_id inner join images as c on c.product_id = a.id where a.status = 1 and a.id = $1";

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

function getProductDetailBySeach(value) {
    const sql = "select  a.id, a.name, b.max_price, b.min_price, c.url->'cover' as cover from product a inner join (select max(price) as max_price, min(price) as min_price, product_id from productvariant group by product_id) b on a.id = b.product_id inner join images as c on c.product_id = a.id where a.status = 1 and a.name @@ plainto_tsquery($1)";

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

function getDashBoardSeller(value) {
    const sql = "select status, count(status) from orders where shop_id = $1 and now() between deliverytime and deliverytime + interval '336 hours' GROUP BY status;";

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

function getCountProductByShop(value) {
    const sql = "select product_id, COUNT(*) AS TotalRows from productvariant a join product b on b.id = a.product_id where b.status = 1 and b.shop_id = $1 group by product_id";

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

function getCountVoucherByShop(value) {
    const sql = "select count(id) as sale from voucher where now() between timestart and timeend and shop_id = $1";

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

function getWalletByShop(value) {
    const sql = "SELECT wallet FROM shop WHERE id = $1";

    return db.simpleQuery(sql, value)
    .then( res =>  {
        if (res.rowCount > 0)
        {
            return res.rows[0];
        }
        return false;
    })
    .catch(error => { return false;});
}

function getDashBoardAdmin(value) {
    const sql = "select status, count(status) from orders where now() between deliverytime and deliverytime + interval '336 hours' GROUP BY status;";

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

function getCountProductByAdmin(value) {
    const sql = "select product_id, COUNT(*) AS TotalRows from productvariant a join product b on b.id = a.product_id where b.status = 1 group by product_id";

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

function getCountVoucherByAdmin(value) {
    const sql = "select count(id) as sale from voucher where now() between timestart and timeend";

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

/*
admin
*/
function checkAdminExist(value) {
    const sql = 'SELECT * FROM admin WHERE username = $1';

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        else return false;
    })
    .catch(error => {return error;});
}

function insertAdmin(values) {
    const sql = 'INSERT INTO admin(username, password, fullname, email, phone, role) VALUES($1, $2, $3, $4, $5, $6) RETURNING id';
    
    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
        return res.rows[0].id;
        return false;
    })
    .catch(error => {return error;});
}

function insertAdminPermission(value) {
    const sql = "INSERT INTO adminpermission(name) VALUES($1) RETURNING id";

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
        return res.rows[0].id;
        return false;
    })
    .catch(error => {return error;});
}

function insertAdminRole(value) {
    const sql = "INSERT INTO adminRole(admin_id, adminper_id) VALUES($1, $2)";

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
        return true;
        return false;
    })
    .catch(error => {return error;});
}

function insertAdminPerDetail(values) {
    const sql = "INSERT INTO adminPerDetail(adminper_id, permission, act_name, act_code, status) VALUES($1, $2, $3, $4, $5)";

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
        return true;
        return false;
    })
    .catch(error => {return error;});
}

function updateAdminPerDetail(values) {
    const sql = "UPDATE adminPerDetail SET status = $2 WHERE id = $1";

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
        return true;
        return false;
    })
    .catch(error => {return error;});
}

function getAdmin(value) {
    const sql = "SELECT * FROM admin WHERE id != 1";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        else return false;
    })
    .catch(error => { return false;}); 
}

function getSaleByAdmin(value) {
    const sql = "select a.*, b.name as shop_name from voucher a join shop b on b.id = a.shop_id where now() between timestart and timeend";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        else return false;
    })
    .catch(error => { return false;}); 
}

function getAdminDetailInfo(value) {
    const sql = "select a.id, a.act_code as code, a.status, b.id as adminper_id, b.name as role_name, d.username, d.fullname, d.email, d.phone from adminperdetail a join adminpermission b on b.id = a.adminper_id join adminrole c on c.adminper_id = a.adminper_id join admin d on d.id = c.admin_id where d.id = $1";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        else return false;
    })
    .catch(error => { return false;}); 
}

function checkExistShopByName(value) {
    const sql = "SELECT id FROM shop WHERE username = $1";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rows[0])
            return true;
        else return false;
    })
    .catch(error => { return false;}); 
}

function insertShop(values) {
    const sql = "INSERT INTO shop(fullname, phone, email, name, username, password, address) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id";

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
        return res.rows[0].id;
        return false;
    })
    .catch(error => {return error;});
}

function getShop(value) {
    const sql = "SELECT * FROM shop ORDER BY created_at";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
        return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function getShopById(value) {
    const sql = "SELECT * FROM shop WHERE id = $1";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
        return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function getShopWillPay(value) {
    const sql = "select sum(add) from ( select id as order_id, add(sum(totalwithdis), shippingfee) from ( select a.id, c.amount, c.price, totalwithdis(c.amount, c.price, c.discount),  a.shippingfee from orders as a inner join purchase as b on b.id = a.purchase_id inner join orderdetail as c on c.order_id = a.id where a.shop_id = $1 and a.status < 3 and a.status >= 0) as a group by id, shippingfee) as a";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
        return res.rows[0];
        return false;
    })
    .catch(error => {return error;});
}

function getShopPaidCurrentWeek(values) {
    const sql = "select sum(add) from (select id as order_id, add(sum(total_ord), shippingfee) from (select a.id, c.amount, c.price, total_ord(c.amount, c.price),  a.shippingfee from orders as a inner join purchase as b on b.id = a.purchase_id inner join orderdetail as c on c.order_id = a.id where a.created_at >= $1 and a.created_at <= $2 and a.shop_id = $3 and a.status = 3 ) as a group by id, shippingfee) as a";

    return db.simpleQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
        return res.rows[0];
        return false;
    })
    .catch(error => {return error;});
}

function getShopPaidCurrentMonth(month, value) {
    const sql = `select sum(add) from (select id as order_id, add(sum(total_ord), shippingfee) from (select a.id, c.amount, c.price, total_ord(c.amount, c.price),  a.shippingfee from orders as a inner join purchase as b on b.id = a.purchase_id inner join orderdetail as c on c.order_id = a.id where ${month} and a.shop_id = $1 and a.status = 3 ) as a group by id, shippingfee) as a`;

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
        return res.rows[0];
        return false;
    })
    .catch(error => {return error;});
}

function getShopPaidAll(value) {
    const sql = `select sum(add) from (select id as order_id, add(sum(total_ord), shippingfee) from (select a.id, c.amount, c.price, total_ord(c.amount, c.price),  a.shippingfee from orders as a inner join purchase as b on b.id = a.purchase_id inner join orderdetail as c on c.order_id = a.id where a.shop_id = $1 and a.status = 3 ) as a group by id, shippingfee) as a`;

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
        return res.rows[0];
        return false;
    })
    .catch(error => {return error;});
}

function updateShopStatus(values) {
    const sql = "UPDATE shop SET status = $1 WHERE id = $2";

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
        return true;
        return false;
    })
    .catch(error => {return error;});
}

function checkOrderPaid(value) {
    const sql = "SELECT * FROM orders WHERE id = $1 and paid = 0";

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
        return true;
        return false;
    })
    .catch(error => {return error;});
}

function updateShopWallet(orderId, values) {
    const sql = "UPDATE shop SET wallet = wallet + $1 WHERE id = $2";
    
    return checkOrderPaid([orderId])
    .then(res => {
        if (res == true) {
            return db.excuteQuery(sql, values)
            .then(res => {
                if (res.rowCount > 0)
                return true;
                return false;
            })
            .catch(error => {return error;});
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

function getUser(value) {
    const sql = "SELECT * FROM users";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
        return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

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


function deleteUser(value) {
    const sql = 'DELETE FROM users WHERE id = $1';

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
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

function insertShopAddressBook(values) {
    const sql = 'INSERT INTO addressbook(user_id, shop_id, province_id, fullname, phone, isdefault) VALUES ($1, $2, $3, $4, $5, $6)';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function getUserAddressBookExist(role, value) {
    const col = role == 1 ? 'user_id' : 'shop_id';
    const sql = `SELECT * FROM addressbook WHERE ${col} = $1`;

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

function getShopAddressBook(value) {
    const sql = 'select a.fullname, a.phone, a.isdefault, a.id as book_id, b.code as province_code, c.code as district_code, d.code as ward_code, e.name as identity_name, b.name as province_name, c.name as district_name, d.name as ward_name, e.id as identity_id from addressbook as a inner join province as b on b.id = a.province_id inner join district as c on c.id = b.district_id inner join ward as d on d.id = c.ward_id inner join identitydetail as e on e.id = d.identity_id where shop_id = $1 ORDER BY a.isdefault DESC';

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

function getShopAddressBookByShopId(value) {
    const sql = "SELECT * FROM addressbook WHERE shop_id = $1";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
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

//user-purchase
function getUserPurchaseWaiting(value) {
    const sql = "select a.status, a.id as order_id, a.shippingfee as ship, a.status, c.name, c.variant, c.amount, c.price, c.discount, a.shop_id , d.name as shop_name, c.cover, c.productvariant_id as pdv_id, f.rating, f.id as p_id, g.rating as user_rating, g.id as user_rating_id from orders as a inner join purchase as b on b.id = a.purchase_id inner join orderdetail as c on c.order_id = a.id inner join shop as d on d.id = a.shop_id inner join productvariant as e on e.id = c.productvariant_id inner join product as f on f.id = e.product_id inner join rating as g on g.user_id = b.user_id and g.product_id = e.product_id where b.user_id = $1 order by a.created_at desc";

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function getOrderAll(value) {
    const sql = "select a.status, a.created_at, a.shippingfee, b.payment_id, c.name, c.variant, c.amount, c.price, c.discount, a.shop_id , d.name as shop_name, c.cover, c.productvariant_id as pdv_id, a.id as order_id from orders as a inner join purchase as b on b.id = a.purchase_id inner join orderdetail as c on c.order_id = a.id inner join shop as d on d.id = a.shop_id order by a.id desc";

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function getUserByOrder(value) {
    const sql = "select a.username from users as a inner join purchase as b on b.user_id = a.id inner join orders as c on c.purchase_id = b.id where c.id = $1";

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows[0];
        return false;
    })
    .catch(error => {return error;});
}

function getOrderByShopId(value) {
    const sql = "select a.shop_id, a.shippingfee, a.created_at, d.username, d.id as user_id, b.name, b.price, b.amount, b.variant, b.cover, b.discount, a.id as order_id, a.status, b.productvariant_id as pdv_id, c.payment_id, e.province, e.district from orders as a inner join orderdetail as b on b.order_id = a.id inner join purchase as c on c.id = a.purchase_id inner join users as d on d.id = c.user_id inner join addressorder as e on e.purchase_id = c.id where a.shop_id = $1 order by a.created_at desc";

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function getOrderWillPayByShopId(value) {
    const sql = "select a.shop_id, a.shippingfee, a.created_at, d.username, d.id as user_id, b.name, b.price, b.amount, b.variant, b.cover, a.id as order_id, a.status, b.productvariant_id as pdv_id, c.payment_id, e.province, e.district from orders as a inner join orderdetail as b on b.order_id = a.id inner join purchase as c on c.id = a.purchase_id inner join users as d on d.id = c.user_id inner join addressorder as e on e.purchase_id = c.id where a.shop_id = $1 and a.status >= 0 and a.status < 3 order by a.created_at desc";

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function checkExistCart(values) {
    const sql = "SELECT * FROM cart WHERE user_id = $1 and productvariant_id = $2";

    return db.simpleQuery(sql, values)
    .then(res => {
        if (res.rows[0])
            return res.rows[0];
        else return false;
    })
    .catch(e => {
        console.log('err:', e);
        return e;
    });
}

function getStockAmount(value) {
    const sql = "SELECT stockamount FROM productvariant WHERE id = $1";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rows[0])
            return res.rows[0];
        else return false;
    })
    .catch(e => {
        console.log('err:', e);
        return e;
    });
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

function getCartQuantity(values) {
    const sql = "SELECT amount FROM cart WHERE user_id = $1 and productvariant_id = $2";

    return db.simpleQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        else return false;
    })
    .catch(e => {
        console.log('err:', e);
        return false;
    });
}

function getCart(value) {
    const sql = "SELECT * FROM cart WHERE user_id = $1";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        else return false;
    })
    .catch(e => {
        console.log('err:', e);
        return false;
    });
}

function getCartAll(value) {
    const sql = "select a.amount, a.id as cart_id, c.name, c.price, c.id, c.stockamount as stock, g.id as product_id, d.attribute->'Size' as size, d.attribute->'Color' as color, e.url->'cover' as cover, f.name as shop from cart as a inner join users as b on b.id = a.user_id inner join productvariant as c on c.id = a.productvariant_id inner join variantdetail as d on d.id = c.variant_id inner join images as e on e.product_id = c.product_id inner join product as g on g.id = c.product_id inner join shop as f on f.id = g.shop_id where b.id = $1 order by f.id";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        else return false;
    })
    .catch(e => {
        console.log('err:', e);
        return false;
    });
}

function getCartCheckOut(values) {
    const sql = "select c.name, a.amount, c.price, c.id as pvd_id, c.w, c.l, c.h, c.weight, d.attribute->'Color' as color, d.attribute->'Size' as size, f.name as shop, f.id as shop_id, e.url->'cover' as cover from cart as a inner join productvariant as c on c.id = a.productvariant_id inner join product as b on b.id = c.product_id inner join variantdetail as d on d.id = c.variant_id inner join images as e on e.product_id = c.product_id inner join shop as f on f.id = b.shop_id where a.user_id = $1 and c.id = $2";

    return db.simpleQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        else return false;
    })
    .catch(e => {
        console.log('err:', e);
        return false;
    });
}

function getCartByUserIdAndPVId(values) {
    const sql = "select b.price, a.amount from cart as a inner join productvariant as b on b.id = a.productvariant_id inner join users as c on c.id = a.user_id where  c.id = $1 and b.id = $2";

    return db.simpleQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        else return false;
    })
    .catch(e => {
        console.log('err:', e);
        return false;
    });
}

function updateCart(values) {
    const sql = 'UPDATE cart SET amount = $1 WHERE user_id = $2 AND productvariant_id = $3';

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}


function deleteCart(value) {
    const sql = "DELETE FROM cart WHERE id = $1";

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function deleteCartByUser(value) {
    const sql = "DELETE FROM cart WHERE user_id = $1 and productvariant_id = $2";

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}


function updateUserRating(values) {
    const sql = "UPDATE rating SET rating = $1 WHERE id = $2 ";

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function updateRating(values) {
    const sql = "UPDATE product SET rating = $1 WHERE id = $2";

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function getUserAndProductByOrderId(value) {
    const sql = "select a.shop_id, d.id, e.user_id, sum(b.amount) from orders as a inner join orderdetail as b on b.order_id = a.id inner join productvariant as c on c.id = b.productvariant_id inner join product as d on d.id = c.product_id inner join purchase as e on e.id = a.purchase_id where a.id = $1 group by e.user_id, d.id, a.shop_id";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function getProductByPDVID(value) {
    const sql = "select b.id from productvariant as a inner join product as b on b.id = a.product_id where a.id = $1";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows[0];
        return false;
    })
    .catch(error => {return error;});
}

function checkRatingExist(values) {
    const sql = "SELECT * FROM rating WHERE user_id = $1 and product_id = $2";

    return db.simpleQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function insertUserRating(values) {
    const sql = "INSERT INTO rating(user_id, product_id) VALUES($1, $2)";

    return checkRatingExist(values)
    .then(res => {
        if (res == false) {
            return db.excuteQuery(sql, values)
            .then(res => {
                if (res.rowCount > 0)
                    return true;
                return false;
            })
            .catch(error => {return error;});
        }
       // else return false;
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

function updateCategorylevel1(type, values) {
    return nameUpdate(type, values);
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
    const sql = 'select distinct b.name, b.id from product as a inner join categorylevel1 as b on b.id = a.categorylevel1_id';

    return db.simpleQuery(sql)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function getCategoryLevelOneAll() {
    const sql = "SELECT * FROM categorylevel1";

    return db.simpleQuery(sql)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function getCategoryHasValue() {
    const sql = "select distinct a.name, a.id from categorylevel1 as a inner join categorylevel2 as b on b.categorylevel1_id = a.id";

    return db.simpleQuery(sql)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function getCategoryLevelTwoAll() {
    const sql = 'SELECT * FROM categorylevel2';

    return db.simpleQuery(sql)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return error;});
}

function getCategoryLevelTwo(value) {
    const sql = 'SELECT a.id, a.name, b.name as cate1_name FROM categorylevel2 as a inner join categorylevel1 as b on b.id = a.categorylevel1_id WHERE categorylevel1_id = $1';

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return -1;});
}

function getCategoryLevelTwoByShop(value) {
    const sql = "SELECT DISTINCT a.id, a.name FROM categorylevel2 as a inner join product as b on b.categorylevel2_id = a.id WHERE b.shop_id = $1";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows;
        return false;
    })
    .catch(error => {return -1;});
}

function getCategoryLevelTwoByPdv(value) {
    const sql = "SELECT a.id FROM categorylevel2 a join product b on b.categorylevel2_id = a.id join productvariant c on c.product_id = b.id WHERE c.id = $1";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows[0];
        return false;
    })
    .catch(error => {return false;});
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

function updateProductVariantAmount(values) {
    const sql = "UPDATE productvariant SET stockamount = $1 WHERE id = $2";

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function updateProductSelled(values) {
    const sql = "update product set selled = selled + $1 WHERE id = $2";

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
}

function updateProductVariantAmountAuto(values) {
    const sql = "UPDATE productvariant SET stockamount = stockamount + $1 WHERE id = $2";

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        return false;
    })
    .catch(error => {return error;});
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
    const sql = 'UPDATE productvariant set sku = $1, price = $2, stockamount = $3, w = $4, l = $5, h = $6, weight = $7 WHERE id=$8';

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
    const sql = 'SELECT * FROM product ORDER BY status desc';

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

function getFirstProductById(value) {
    const sql = "select a.name, a.id as product_id, a.rating, a.categorylevel2_id as cate2_id, max(b.price) as max, c.attribute->'Color' as color, c.attribute->'Size' as size, b.price, d.url->'cover' as cover, d.url as url from product as a inner join productvariant as b on b.product_id = a.id inner join variantdetail as c on c.id = b.variant_id inner join images as d on d.product_id = a.id where a.id = $1 and a.status = 1 group by a.name, a.id, c.attribute, b.price, d.url order by b.price desc LIMIT 8";

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

function getProductSeller(value) {
    const sql = "SELECT * FROM product WHERE shop_id = $1";

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
    const sql = "select a.status, a.id as product_id, a.name, a.rating, d.url->'cover' as cover, d.url as url, max(b.price), min(b.price) , a.rating from product as a inner join productvariant as b on b.product_id = a.id inner join images as d on d.product_id = a.id where a.shop_id = $1 and a.status = 1 and b.price = (select max(price) from productvariant where product_id = a.id) group by a.name, a.id, d.url, b.price";

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

function getProductByCateOne(price, rating, value) {
    var sortBy = 'min';
    var filter_price = 'd.price > 0';
    var filter_rating = 'b.rating >= 0';
    switch(price) {
        case '1': 
            sortBy = 'min';
            break;
        case '2':
            sortBy = 'min desc';
            break;
        case '3':
            sortBy = 'b.created_at desc';
            break;
        case '4':
            sortBy = 'b.created_at asc';
            break;
        case '5': 
            filter_price = 'd.price < 300000';
            break;
        case '6':
            filter_price = 'd.price >= 300000 and d.price < 1000000';
            break;
        case '7':
            filter_price = 'd.price >= 1000000 and d.price < 5000000';
            break;
        case '8':
            filter_price = 'd.price >= 5000000';
            break;
    }

    switch (rating) {
        case '9': 
            filter_rating = 'b.rating = 5';
            break;
        case '10':
            filter_rating = 'b.rating >= 4';
            break;
        case '11':
            filter_rating = 'b.rating >= 3';
            break;
        case '12':
            filter_rating = 'b.rating >= 2';
            break;
        case '13':
            filter_rating = 'b.rating >= 1';
            break;
    }

    const sql = `select max(d.price) as max, min(d.price) as min, b.name, b.id as product_id, c.url -> 'cover' as url, e.name as shop, avg(b.rating)::numeric(10,1) as rating , b.created_at from categorylevel1 as a inner join product as b on b.categorylevel1_id = a.id inner join images as c on c.product_id = b.id inner join productvariant as d on d.product_id = b.id inner join shop as e on e.id = b.shop_id where a.id = $1 and b.status = 1 AND ${filter_price} AND ${filter_rating} GROUP BY b.name, b.id, c.url, e.name, b.created_at order by ${sortBy}`;
   
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

function getProductByCateTwo(price, rating, value) {
    var sortBy = 'min';
    var filter_price = 'd.price > 0';
    var filter_rating = 'b.rating >= 0';
    switch(price) {
        case '1': 
            sortBy = 'min';
            break;
        case '2':
            sortBy = 'min desc';
            break;
        case '3':
            sortBy = 'b.created_at desc';
            break;
        case '4':
            sortBy = 'b.created_at asc';
            break;
        case '5': 
            filter_price = 'd.price < 300000';
            break;
        case '6':
            filter_price = 'd.price >= 300000 and d.price < 1000000';
            break;
        case '7':
            filter_price = 'd.price >= 1000000 and d.price < 5000000';
            break;
        case '8':
            filter_price = 'd.price >= 5000000';
            break;
    }

    switch (rating) {
        case '9': 
            filter_rating = 'b.rating = 5';
            break;
        case '10':
            filter_rating = 'b.rating >= 4';
            break;
        case '11':
            filter_rating = 'b.rating >= 3';
            break;
        case '12':
            filter_rating = 'b.rating >= 2';
            break;
        case '13':
            filter_rating = 'b.rating >= 1';
            break;
    }

    const sql = `select  a.name as cate2_name, max(d.price) as max, min(d.price) as min, b.name, b.id as product_id, c.url -> 'cover' as url, e.name as shop, avg(b.rating)::numeric(10,1) as rating from categorylevel2 as a inner join product as b on b.categorylevel2_id = a.id inner join images as c on c.product_id = b.id inner join productvariant as d on d.product_id = b.id inner join shop as e on e.id = b.shop_id where a.id = $1 and b.status = 1 AND ${filter_price} AND ${filter_rating} GROUP BY a.name, b.name, b.id, c.url, e.name, b.created_at order by ${sortBy}`;

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

function getProductAllById(value) {
    const sql = "select a.name, a.id as product_id, a.rating, a.categorylevel2_id as cate2_id, max(b.price) as max, c.attribute->'Color' as color, c.attribute->'Size' as size, b.price, d.url->'cover' as cover, d.url as url from product as a inner join productvariant as b on b.product_id = a.id inner join variantdetail as c on c.id = b.variant_id inner join images as d on d.product_id = a.id where a.id = $1 and a.status = 1 group by a.name, a.id, c.attribute, b.price, d.url";

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

function getShopByProductId(value) {
    const sql = "SELECT b.id, b.name as shop_name FROM product as a inner join shop as b on b.id = a.shop_id WHERE a.id = $1";

    return db.simpleQuery(sql, value)
    .then( res =>  {
        if (res.rowCount > 0)
        {
            return res.rows[0];
        }
        return false;
    })
    .catch(error => { return false;});
}

function getShopProductById(value) {
    const sql = "select  max(d.price) as max, min(d.price) as min, b.name, b.id as product_id, c.url -> 'cover' as url, e.name as shop, avg(f.rating)::numeric(10,1) as rating from categorylevel1 as a inner join product as b on b.categorylevel1_id = a.id inner join images as c on c.product_id = b.id inner join productvariant as d on d.product_id = b.id inner join shop as e on e.id = b.shop_id inner join rating as f on f.product_id = b.id where e.id = $1 and b.status = 1 GROUP BY b.name, b.id, c.url, e.name";

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

function getProductInfoByID(value) {
    const sql = "select  a.id, a.name, b.max_price, b.min_price, c.url->'cover' as cover from product a inner join (select max(price) as max_price, min(price) as min_price, product_id from productvariant group by product_id) b on a.id = b.product_id inner join images as c on c.product_id = a.id where a.status = 1 and a.id = $1";

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

function getProductDetailByID(value) {
    const sql = "select  a.id, a.name, b.max_price, b.min_price, c.url->'cover' as cover from product a inner join (select max(price) as max_price, min(price) as min_price, product_id from productvariant group by product_id) b on a.id = b.product_id inner join images as c on c.product_id = a.id where a.status = 1 order by a.created_at desc";

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

function getListNewProduct(value) {
    const sql = "select  a.id, a.name, a.rating, b.max_price, b.min_price, c.url->'cover' as cover from product a inner join (select max(price) as max_price, min(price) as min_price, product_id from productvariant group by product_id) b on a.id = b.product_id inner join images as c on c.product_id = a.id where a.status = 1 order by a.created_at desc limit 10";

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

function getListSeleldProduct(value) {
    const sql = "select  a.id, a.name, b.max_price, b.min_price, c.url->'cover' as cover, d.name as cate from product a inner join (select max(price) as max_price, min(price) as min_price, product_id from productvariant group by product_id) b on a.id = b.product_id inner join images as c on c.product_id = a.id inner join categorylevel1 as d on d.id = a.categorylevel1_id where a.status = 1 and d.id = $1 order by a.selled desc limit 10";

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

function getCateShop(value) {
    const sql = "select distinct c.id as cate2_id, c.name as cate_name from categorylevel1 as a inner join product as b on b.categorylevel1_id = a.id inner join categorylevel2 as c on c.categorylevel1_id = a.id where b.shop_id = $1 and b.status = 1 order by c.id asc";

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
    const sql = 'select a.name, a.status, c.attribute, b.sku, b.price, b.stockamount, b.id, b.w, b.l, b.h, b.weight, d.url, e.name as shop_name from productvariant as b inner join product as a on b.product_id = a.id inner join variantdetail as c on c.id = b.variant_id inner join images as d on d.product_id = a.id inner join shop as e on a.shop_id = e.id where a.id = $1';

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

function getProductVariantBeforeSell(value) {
    const sql = "select b.price, b.id as productvariant_id, b.stockamount, c.attribute->'Color' as color, c.attribute->'Size' as size from product as a inner join productvariant as b on b.product_id = a.id inner join variantdetail as c on c.id = b.variant_id where  a.id = $1";

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
function insertPurchase(values) {
    const sql = 'INSERT INTO purchase(user_id, payment_id, datepurchase, payref) VALUES ($1, $2, $3, $4) RETURNING id';

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
    const sql = 'INSERT INTO orders(purchase_id, shop_id, shippingfee, deliverytime, status) VALUES ($1, $2, $3, $4, $5) RETURNING id';

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

function insertOrderDetail(values) {
    const sql = "INSERT INTO orderdetail(order_id, productvariant_id, name, variant, amount, price, cover, discount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";

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

function insertAddressOrder(values) {
    const sql = "INSERT INTO addressorder(purchase_id, province, district, ward, identity, fullname, phone) VALUES ($1, $2, $3, $4, $5, $6, $7)";

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

function checkPurchasePayRef(value) {
    const sql = "SELECT * FROM purchase WHERE payref = $1";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return true;
        else return false;
    })
    .catch(e => {
        console.log('err:', e);
        return false;
    });
}

function getOrderById(value) {
    //const sql = "SELECT * FROM orders as a inner join purchase as b on b.id = a.order_id WHERE id = $1";
    const sql = "SELECT a.status as order_status, * FROM orders as a inner join purchase as b on b.id = a.purchase_id WHERE a.id = $1";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
            return res.rows[0];
        else return false;
    })
    .catch(e => {
        console.log('err:', e);
        return false;
    });
}

function getOrderAddressById(value) {
    const sql = "select a.id as order_id, c.fullname, c.phone, c.identity, c.ward, c.district, c.province from orders as a inner join purchase as b on b.id = a.purchase_id inner join addressorder as c on b.id = c.purchase_id where a.id = $1";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
        {
            return res.rows[0];
        }
        return false;
    })
    .catch(error => {return error;});
}

function getOrderDetailByOrderId(value) {
    const sql = "select a.shippingfee, b.discount, b.name, b.amount, b.price, b.variant, b.cover, b.productvariant_id as pdv_id from orders as a inner join orderdetail as b on a.id = b.order_id where a.id = $1";

    return db.excuteQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
        {
            return res.rows;
        }
        return false;
    })
    .catch(error => {return error;});
}

function updateOrder(values) {
    const sql = "UPDATE orders SET status = $1 WHERE id = $2";

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

function updateOrderAndPaid(values) {
    const sql = "UPDATE orders SET status = $1, paid = 1 WHERE id = $2";

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

function updateOrderReason(values) {
    const sql = "UPDATE orders SET status = $1, cancel = $2 WHERE id = $3";

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
/*
 <==========================================================================>
*/
/*RATING*/
function getRating() {
    const sql = "SELECT * FROM rating";

    return db.simpleQuery(sql)
    .then(res => {
        if (res.rowCount > 0)
        {
            return res.rows;
        }
        return false;
    })
    .catch(error => {return error;});
}

/*
 <==========================================================================>
*/

/*VOUCHER*/
function insertVoucher(values) {
    const sql = "INSERT INTO voucher(categorylevel2_id, shop_id, name, code, status, discount, timestart, timeend) values($1, $2, $3, $4, $5, $6, $7, $8)";

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
        return true;
        return false;
    })
    .catch(error => {return error;});
}

function checkVoucher(values) {
    const sql = "SELECT discount FROM voucher WHERE code = $1 AND shop_id = $2 AND NOW() + interval '7 hours' between timestart and timeend";

    return db.simpleQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
        return res.rows[0];
        return false;
    })
    .catch(error => {return error;});
}

function getVoucher(value) {
    const sql = "select a.id as voucher_id, a.name, a.timestart as timestart, a.timeend, a.code, a.discount, a.status, b.name as catename from voucher a join categorylevel2 b on b.id = a.categorylevel2_id join shop c on c.id = a.shop_id where c.id = $1";

    return db.simpleQuery(sql, value)
    .then(res => {
        if (res.rowCount > 0)
        {
            return res.rows;
        }
        return false;
    })
    .catch(error => {return error;});
}

function updateVoucher(status, values) {
    var sql = "";
    switch(status) {
    case 1: 
        sql = "UPDATE voucher SET name = $1, timestart = $2, timeend = $3, categorylevel2_id = $4, discount = $5 WHERE id = $6";
        break;
    case 2: 
        sql = "UPDATE voucher SET name = $1, timeend = $2, categorylevel2_id = $3 WHERE id = $4";
        break;
    }

    return db.excuteQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
        return true;
        return false;
    })
    .catch(error => {return error;});
}

function getVoucherByID(values) {
    const sql = "select a.id as voucher_id, a.categorylevel2_id as cate_id, a.name, a.timestart as timestart, a.timeend, a.code, a.discount, a.status, b.name as catename from voucher a join categorylevel2 b on b.id = a.categorylevel2_id join shop c on c.id = a.shop_id where c.id = $1 AND a.id = $2";

    return db.simpleQuery(sql, values)
    .then(res => {
        if (res.rowCount > 0)
        {
            return res.rows;
        }
        return false;
    })
    .catch(error => {return error;});
}

/*
 <==========================================================================>
*/

module.exports = {
    getProductBySearch,
    getProductDetailBySeach,

    getDashBoardSeller,
    getCountProductByShop,
    getCountVoucherByShop,
    getWalletByShop,
    getDashBoardAdmin,
    getCountProductByAdmin,
    getCountVoucherByAdmin,

    insertAdmin,
    insertAdminPermission,
    insertAdminRole,
    insertAdminPerDetail,
    updateAdminPerDetail,
    checkAdminExist,
    getAdmin,
    getSaleByAdmin,
    getAdminDetailInfo,

    checkExistShopByName,
    insertShop,
    getShop,
    getShopById,
    getShopWillPay,
    getShopPaidCurrentWeek,
    getShopPaidCurrentMonth,
    getShopPaidAll,
    updateShopStatus,
    updateShopWallet,

    checkEmailExist,
    checkUserExist,
    getUser,
    getUserInfo,
    insertUser,
    updateUserProfile,
    updateUserPassword,
    updateUserPasswordByEmail,
    deleteUser,
    updateUserIsverified,
    insertUserIdentityDetail,
    insertUserWard,
    insertUserDistrict,
    insertUserProvince,
    insertUserAddressBook,
    insertShopAddressBook,
    getUserAddressBookExist,
    getUserAddressBook,
    getShopAddressBook,
    getAddressBookById,
    getShopAddressBookByShopId,
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

    getUserPurchaseWaiting,
    getOrderAll,
    getOrderByShopId,
    getOrderWillPayByShopId,
    getUserByOrder,
    
    checkExistCart,
    insertCart,
    getCartQuantity,
    getStockAmount,
    updateCart,
    deleteCart,
    deleteCartByUser,
    checkRatingExist,
    insertUserRating,
    updateUserRating,
    updateRating,
    getUserAndProductByOrderId,
    getProductByPDVID,
    getCart,
    getCartAll,
    getCartByUserIdAndPVId,
    getCartCheckOut,

    insertCategoryLevelOne,
    insertCategoryLevelTwo,
    updateCategorylevel1,
    cateDelete,
    childCateUpdate,
    insertCateLevel,
    
    getCategoryLevelOne,
    getCategoryLevelOneAll,
    getCategoryHasValue,
    getCategoryLevelTwoAll,
    getCategoryLevelTwo,
    getCategoryLevelTwoByShop,
    getCategoryLevelTwoByPdv,
    getCategoryLevelThree,

    insertProduct,
    insertProductVariant,
    updateProduct,
    updateProductVariant,
    updateProductStatus,
    getProductVariantBeforeSell,
    getProduct,
    getProductById,
    getFirstProductById,
    getProductSeller,
    getProductByShop,
    getProductByCateOne,
    getProductByCateTwo,
    getProductAllById,
    getShopByProductId,
    getShopProductById,
    getProductInfoByID,
    getProductDetailByID,
    getListNewProduct,
    getListSeleldProduct,
    getCateShop,
    getProductVariant,
    getProductVariantInfo,
    updateProductVariantAmount,
    updateProductSelled,
    updateProductVariantAmountAuto,
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

    insertPurchase,
    insertOrder,
    insertOrderDetail,
    insertAddressOrder,
    checkPurchasePayRef,
    getOrderById,
    getOrderAddressById,
    getOrderDetailByOrderId,
    updateOrder,
    updateOrderAndPaid,
    updateOrderReason,
    deleteTest,

    getRating,

    insertVoucher,
    checkVoucher,
    getVoucher,
    updateVoucher,
    getVoucherByID,
}
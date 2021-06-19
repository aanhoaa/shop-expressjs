const { Pool } = require('pg')
//const { Sequelize } = require('sequelize');

// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'shop',
//   password: '123456',
//   port: 5432,
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
// });

const pool = new Pool({
  user: process.env.USERDB,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORDDB,
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function simpleQuery(sql, values) {
  return await pool.query({
    text: sql,
    values: values
  })
  .then(res => {
    //console.log('res:', res)
    return res;
  })
  .catch(e => console.error(e.stack))
}

async function excuteQuery(sql, values) {
  return await simpleQuery(sql, values)
  .then(data => {
    if (data && (data.rowCount > 0)) {
      return data;
    } else {
      return ({
          type: 'QUERY DB FAIL',
          message: "affected rows = 0 or insertID null"
      })
    }
  })
}
async function multiExcuteQuery(sql, values) {
  return await pool.multi({
    text: sql,
    values: values
  })
  .then(res => {
    //console.log('res:', res)
    return res;
  })
  .catch(e => console.error(e.stack))
}



module.exports = {
  multiExcuteQuery,
  simpleQuery,
  excuteQuery,
    query: (text, params, callback) => {
      return pool.query(text, params, callback)
    },
}
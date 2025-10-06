const mysql = require('mysql2');

const pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password :'',
    port : 5000,
    database : 'db_ppgs_system'
})
module.exports = pool.promise();
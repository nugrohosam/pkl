var mysql = require('mysql')

var connection = mysql.createPool({
 host:'localhost',
 user:'root',
 password:'administrator',
 database:'ipl',
 port: 3306,
 debug: false,
 multipleStatements: true
})

module.exports.connection = connection;
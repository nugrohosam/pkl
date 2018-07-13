var pg = require('pg')
var connection = pg.Client({
    user: 'expressconn',
    host: 'localhost',
    database: 'dbipl',
    password: 'expressconn',
    port: 5432,
})

module.exports.connection = connection;
const pg = require('pg')

<<<<<<< HEAD
const dbconn = pg.Pool({
=======
const pool = pg.Pool({
>>>>>>> 1480a50691c051f5454f2c41e9cffeb0bd96c576
    user: 'expressconn',
    host: 'localhost',
    database: 'dbipl',
    password: 'expressconn',
    port: 5432,
})

module.exports = dbconn
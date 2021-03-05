const pg = require('pg')

const dbconn = pg.Pool({
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
})

module.exports = dbconn
const pg = require('pg')

const dbconn = pg.Pool({
    user: 'expressconn',
    host: 'localhost',
    database: 'dbipl',
    password: 'expressconn',
    port: 5432,
})

module.exports = dbconn
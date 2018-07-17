const pg = require('pg')

const pool = pg.Pool({
    user: 'expressconn',
    host: 'localhost',
    database: 'dbipl',
    password: 'expressconn',
    port: 5432,
})

module.exports = {
    query: (text, params) => pool.query(text, params)
}   
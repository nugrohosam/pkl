const pg = require('pg')

const pool = pg.Pool({
    user: 'expresconn',
    host: 'localhost',
    database: 'dbipl',
    password: 'expressconn',
    port: 50851,
})

module.exports = {
    query: (text, params) => pool.query(text, params)
}   
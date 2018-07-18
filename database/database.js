const pg = require('pg')

const pool = pg.Pool({
    user: 'admin',
    host: 'localhost',
    database: 'dbipl',
    password: 'admin',
    port: 50851,
})

module.exports = {
    query: (text, params) => pool.query(text, params)
}   
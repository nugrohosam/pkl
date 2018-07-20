const pg = require('pg')

const dbconn = pg.Pool({
    user: 'expressconn',
    host: 'localhost',
    database: 'dbipl',
    password: 'expressconn',
    port: 5432,
})
dbconn.connect(function (err) {
    if (err) {
        console.log('Error')
    } else {
        console.log('Connected')
    }
})

module.exports = dbconn
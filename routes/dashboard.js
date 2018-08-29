var express = require('express')
var dashboard = express.Router()
var cors = require('cors')
var dbconn = require('../database/database')
var jwt = require('jsonwebtoken')
var token

var token = jwt.sign({
    data: {
        logged_in: false
    }
}, 'secret_token', {
    expiresIn: '1d'
})
dashboard.use(cors())
var appData = {}
var options = {
    root: './src/views/'
}

var now = new Date()
var year = "" + now.getFullYear()
var month = "" + (now.getMonth() + 1)
if (month.length == 1) {
    month = "0" + month
}
var day = "" + now.getDate()
if (day.length == 1) {
    day = "0" + day
}
var hour = "" + now.getHours()
if (hour.length == 1) {
    hour = "0" + hour
}
var minute = "" + now.getMinutes()
if (minute.length == 1) {
    minute = "0" + minute
}
var second = "" + now.getSeconds()
if (second.length == 1) {
    second = "0" + second
}

dashboard.use((req, res, next) => {
    if (!req.cookies.token) {
        var fileName = 'login.html'
        res.sendFile(fileName, options, (err) => {
            if (err) {
                console.log(err)
            }
        })
    } else {
        token = req.cookies.token
        var decoded = {
            logged_in: false
        }

        try {
            decoded = jwt.verify(token, 'secret_token')
        } catch (error) {
            var fileName = 'login.html'
            res.sendFile(fileName, options, (err) => {
                if (err) {
                    console.log(err)
                }
            })
        }
        if (decoded.logged_in) {
            next()
        } else {
            var fileName = 'login.html'
            res.sendFile(fileName, options, (err) => {
                if (err) {
                    console.log(err)
                }
            })
        }
    }
})

dashboard.get('/', (req, res) => {
    var fileName = 'dashboard.html'
    res.sendFile(fileName, options, (err) => {
        if (err) {
            console.log(err)
        }
    })
})

dashboard.get('/data', async (req, res) => {
    var sql
    var tahun_ini
    var bulan_ini
    var hari_ini
    try {
        await dbconn.query('BEGIN')
        sql = 'SELECT * FROM permintaan WHERE tanggal LIKE \'%' + year + '%\''
        var {
            rows
        } = await dbconn.query(sql)
        tahun_ini = rows.length

        sql = 'SELECT * FROM permintaan WHERE tanggal LIKE \'%' + year + '-' + month + '%\''
        var {
            rows
        } = await dbconn.query(sql)
        bulan_ini = rows.length

        sql = 'SELECT * FROM permintaan WHERE tanggal LIKE \'%' + year + '-' + month + '-' + day + '\''
        var {
            rows
        } = await dbconn.query(sql)
        hari_ini = rows.length

        await dbconn.query('COMMIT')

        var json_return = {
            status: true,
            tahun_ini: tahun_ini,
            bulan_ini: bulan_ini,
            hari_ini: hari_ini
        }
        res.status(200).json(json_return)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            status: false
        }
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

dashboard.get('/find_per_instalasi/:id_instalasi/:tahun', async (req, res) => {

    var params = req.params
    var id_instalasi = params.id_instalasi
    var tahun = params.tahun

    if (tahun == 'all' && id_instalasi == 'all') {
        try {
            await dbconn.query('BEGIN')

            var {
                rows
            } = await dbconn.query('SELECT i.nama_instalasi, count(*) as jumlah_permintaan FROM permintaan p INNER JOIN instalasi i ON p.id_instalasi = i.id_instalasi GROUP BY i.id_instalasi')

            await dbconn.query('COMMIT')
            var response_json = {
                status: true,
                data: rows
            }

            res.status(200).json(response_json)
        } catch (err) {
            var response_json = {
                status: false,
            }

            res.status(200).json(response_json)
        } finally {
            await dbconn.release
        }
    } else if (id_instalasi == 'all' && tahun != 'all') {
        try {
            await dbconn.query('BEGIN')

            var {
                rows
            } = await dbconn.query('SELECT i.nama_instalasi, count(*) as jumlah_permintaan FROM permintaan p INNER JOIN instalasi i ON p.id_instalasi = i.id_instalasi WHERE date_part(\'year\', date(p.tanggal)) = \''+tahun+'\' GROUP BY i.id_instalasi')

            await dbconn.query('COMMIT')
            var response_json = {
                status: true,
                data: rows
            }

            res.status(200).json(response_json)
        } catch (err) {
            var response_json = {
                status: false,
                err: err
            }
            res.status(200).json(response_json)
        } finally {
            await dbconn.release
        }
    } else if (id_instalasi != 'all' && tahun != 'all') {
        try {
            await dbconn.query('BEGIN')

            var {
                rows
            } = await dbconn.query('SELECT date_part(\'month\', date(p.tanggal)) as bulan, count(*) as jumlah_permintaan FROM permintaan p INNER JOIN instalasi i ON p.id_instalasi = i.id_instalasi WHERE date_part(\'year\', date(p.tanggal)) = \''+tahun+'\' and i.id_instalasi = \''+id_instalasi+'\' GROUP BY i.id_instalasi, date_part(\'month\', date(p.tanggal))')

            await dbconn.query('COMMIT')
            var response_json = {
                status: true,
                data: rows
            }

            res.status(200).json(response_json)
        } catch (err) {
            var response_json = {
                status: false,
                err: err
            }
            res.status(200).json(response_json)
        } finally {
            await dbconn.release
        }
    }

})

dashboard.get('/find/:instalasi', async (req, res) => {
    var sql
    var id_instalasi = req.params.instalasi
    var sql
    var rata_rata_diterima_dikerjakan
    var rata_rata_dikerjakan_selesai
    var selesai
    var dikerjakan
    var diterima

    try {
        await dbconn.query('BEGIN')

        sql = 'SELECT buat_rentang_respon_waktu(diterima, dikerjakan) as jumlah_menit FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND diterima is not null AND dikerjakan is not null'
        var {
            rows
        } = await dbconn.query(sql)
        var jumlah_menit = 0
        var i
        var banyak_row = rows.length
        for (i = 0; i < banyak_row; i++) {
            jumlah_menit = jumlah_menit + rows[i].jumlah_menit
        }
        rata_rata_diterima_dikerjakan = minutesToString(jumlah_menit / banyak_row)

        sql = 'SELECT buat_rentang_respon_waktu(dikerjakan, selesai) as jumlah_menit FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND dikerjakan is not null AND selesai is not null'
        var {
            rows
        } = await dbconn.query(sql)
        var jumlah_menit = 0
        var i
        var banyak_row = rows.length
        for (i = 0; i < banyak_row; i++) {
            jumlah_menit = jumlah_menit + rows[i].jumlah_menit
        }
        rata_rata_dikerjakan_selesai = minutesToString(jumlah_menit / banyak_row)

        sql = 'SELECT * FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND selesai is not null'
        var {
            rows
        } = await dbconn.query(sql)
        selesai = rows.length


        sql = 'SELECT * FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND dikerjakan is not null'
        var {
            rows
        } = await dbconn.query(sql)
        dikerjakan = rows.length

        sql = 'SELECT * FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND diterima is not null'
        var {
            rows
        } = await dbconn.query(sql)
        diterima = rows.length

        await dbconn.query('COMMIT')

        var json_return = {
            status: true,
            rata_rata_diterima_dikerjakan: rata_rata_diterima_dikerjakan,
            rata_rata_dikerjakan_selesai: rata_rata_dikerjakan_selesai,
            diterima: diterima,
            selesai: selesai,
            dikerjakan: dikerjakan
        }
        res.status(200).json(json_return)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            status: false
        }
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

dashboard.get('/find/:instalasi/:tahun', async (req, res) => {
    var sql
    var id_instalasi = req.params.instalasi
    var tahun = req.params.tahun
    var sql
    var rata_rata_diterima_dikerjakan
    var rata_rata_dikerjakan_selesai
    var selesai
    var dikerjakan
    var diterima

    try {
        await dbconn.query('BEGIN')

        sql = 'SELECT buat_rentang_respon_waktu(diterima, dikerjakan) as jumlah_menit FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND tanggal LIKE \'%' + tahun + '%\' AND diterima is not null AND dikerjakan is not null'
        var {
            rows
        } = await dbconn.query(sql)
        var jumlah_menit = 0
        var i
        var banyak_row = rows.length
        for (i = 0; i < banyak_row; i++) {
            jumlah_menit = jumlah_menit + rows[i].jumlah_menit
        }
        rata_rata_diterima_dikerjakan = minutesToString(jumlah_menit / banyak_row)

        sql = 'SELECT buat_rentang_respon_waktu(dikerjakan, selesai) as jumlah_menit FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND tanggal LIKE \'%' + tahun + '%\' AND dikerjakan is not null AND selesai is not null'
        var {
            rows
        } = await dbconn.query(sql)
        var jumlah_menit = 0
        var i
        var banyak_row = rows.length
        for (i = 0; i < banyak_row; i++) {
            jumlah_menit = jumlah_menit + rows[i].jumlah_menit
        }
        rata_rata_dikerjakan_selesai = minutesToString(jumlah_menit / banyak_row)

        sql = 'SELECT * FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND tanggal LIKE \'%' + tahun + '%\' AND selesai is not null'
        var {
            rows
        } = await dbconn.query(sql)
        selesai = rows.length


        sql = 'SELECT * FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND tanggal LIKE \'%' + tahun + '%\' AND dikerjakan is not null'
        var {
            rows
        } = await dbconn.query(sql)
        dikerjakan = rows.length

        sql = 'SELECT * FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND tanggal LIKE \'%' + tahun + '%\' AND diterima is not null'
        var {
            rows
        } = await dbconn.query(sql)
        diterima = rows.length

        await dbconn.query('COMMIT')

        var json_return = {
            status: true,
            rata_rata_diterima_dikerjakan: rata_rata_diterima_dikerjakan,
            rata_rata_dikerjakan_selesai: rata_rata_dikerjakan_selesai,
            diterima: diterima,
            selesai: selesai,
            dikerjakan: dikerjakan
        }
        res.status(200).json(json_return)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            status: false
        }
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

dashboard.get('/find/:instalasi/:tahun/:bulan', async (req, res) => {
    var sql
    var id_instalasi = req.params.instalasi
    var tahun = req.params.tahun
    var bulan = req.params.bulan
    var sql
    var rata_rata_diterima_dikerjakan
    var rata_rata_dikerjakan_selesai
    var selesai
    var dikerjakan
    var diterima

    try {
        await dbconn.query('BEGIN')

        sql = 'SELECT buat_rentang_respon_waktu(diterima, dikerjakan) as jumlah_menit FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND tanggal LIKE \'%' + tahun + '-' + bulan + '%\' AND diterima is not null AND dikerjakan is not null'
        var {
            rows
        } = await dbconn.query(sql)
        var jumlah_menit = 0
        var i
        var banyak_row = rows.length
        for (i = 0; i < banyak_row; i++) {
            jumlah_menit = jumlah_menit + rows[i].jumlah_menit
        }
        rata_rata_diterima_dikerjakan = minutesToString(jumlah_menit / banyak_row)

        sql = 'SELECT buat_rentang_respon_waktu(dikerjakan, selesai) as jumlah_menit FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND tanggal LIKE \'%' + tahun + '-' + bulan + '%\' AND diterima is not null AND dikerjakan is not null'
        var {
            rows
        } = await dbconn.query(sql)
        var jumlah_menit = 0
        var i
        var banyak_row = rows.length
        for (i = 0; i < banyak_row; i++) {
            jumlah_menit = jumlah_menit + rows[i].jumlah_menit
        }
        rata_rata_dikerjakan_selesai = minutesToString(jumlah_menit / banyak_row)

        sql = 'SELECT * FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND tanggal LIKE \'%' + tahun + '-' + bulan + '%\' AND selesai is not null'
        var {
            rows
        } = await dbconn.query(sql)
        selesai = rows.length

        sql = 'SELECT * FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND tanggal LIKE \'%' + tahun + '-' + bulan + '%\' AND dikerjakan is not null'
        var {
            rows
        } = await dbconn.query(sql)
        dikerjakan = rows.length

        sql = 'SELECT * FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND tanggal LIKE \'%' + tahun + '-' + bulan + '%\' AND diterima is not null'
        var {
            rows
        } = await dbconn.query(sql)
        diterima = rows.length

        await dbconn.query('COMMIT')

        var json_return = {
            status: true,
            rata_rata_diterima_dikerjakan: rata_rata_diterima_dikerjakan,
            rata_rata_dikerjakan_selesai: rata_rata_dikerjakan_selesai,
            diterima: diterima,
            selesai: selesai,
            dikerjakan: dikerjakan
        }
        res.status(200).json(json_return)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            status: false
        }
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

dashboard.get('/find/:instalasi/:tahun/:bulan/:tanggal', async (req, res) => {

    var sql
    var id_instalasi = req.params.instalasi
    var tahun = req.params.tahun
    var bulan = req.params.bulan
    var tanggal = req.params.tanggal
    var sql
    var rata_rata_diterima_dikerjakan
    var rata_rata_dikerjakan_selesai
    var selesai
    var dikerjakan
    var diterima

    try {
        await dbconn.query('BEGIN')

        sql = 'SELECT buat_rentang_respon_waktu(diterima, dikerjakan) as jumlah_menit FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND tanggal LIKE \'' + tahun + '-' + bulan + '-' + tanggal + '\' AND diterima is not null AND dikerjakan is not null'
        var {
            rows
        } = await dbconn.query(sql)
        var jumlah_menit = 0
        var i
        var banyak_row = rows.length
        for (i = 0; i < banyak_row; i++) {
            jumlah_menit = jumlah_menit + rows[i].jumlah_menit
        }
        rata_rata_diterima_dikerjakan = minutesToString(jumlah_menit / banyak_row)

        sql = 'SELECT buat_rentang_respon_waktu(dikerjakan, selesai) as jumlah_menit FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND tanggal LIKE \'' + tahun + '-' + bulan + '-' + tanggal + '\' AND diterima is not null AND dikerjakan is not null'
        var {
            rows
        } = await dbconn.query(sql)
        var jumlah_menit = 0
        var i
        var banyak_row = rows.length
        for (i = 0; i < banyak_row; i++) {
            jumlah_menit = jumlah_menit + rows[i].jumlah_menit
        }
        rata_rata_dikerjakan_selesai = minutesToString(jumlah_menit / banyak_row)

        sql = 'SELECT * FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND tanggal LIKE \'' + tahun + '-' + bulan + '-' + tanggal + '\'  AND selesai is not null'
        var {
            rows
        } = await dbconn.query(sql)
        selesai = rows.length

        sql = 'SELECT * FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND tanggal LIKE \'' + tahun + '-' + bulan + '-' + tanggal + '\' AND dikerjakan is not null'
        var {
            rows
        } = await dbconn.query(sql)
        dikerjakan = rows.length

        sql = 'SELECT * FROM permintaan WHERE id_instalasi = \'' + id_instalasi + '\' AND tanggal LIKE \'' + tahun + '-' + bulan + '-' + tanggal + '\' AND diterima is not null'
        var {
            rows
        } = await dbconn.query(sql)
        diterima = rows.length

        await dbconn.query('COMMIT')

        var json_return = {
            status: true,
            rata_rata_diterima_dikerjakan: rata_rata_diterima_dikerjakan,
            rata_rata_dikerjakan_selesai: rata_rata_dikerjakan_selesai,
            diterima: diterima,
            selesai: selesai,
            dikerjakan: dikerjakan
        }
        res.status(200).json(json_return)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            status: false,
            message: err
        }
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

dashboard.get('/find_pertumbuhan_pertahun', async (req, res) => {
    try{
        await dbconn.query('BEGIN')
        var { rows } = await dbconn.query('SELECT i.nama_instalasi, count(*) as jumlah_permintaan,  date_part(\'year\', date(p.tanggal)) as tahun, date_part(\'month\', date(p.tanggal)) as bulan FROM permintaan p INNER JOIN instalasi i ON p.id_instalasi = i.id_instalasi WHERE  date(p.tanggal) <= now() GROUP BY i.id_instalasi, date_part(\'year\', date(p.tanggal)), date_part(\'month\', date(p.tanggal)) ORDER BY date_part(\'year\', date(p.tanggal)) desc, date_part(\'month\', date(p.tanggal)) asc')
        
        await dbconn.query('COMMIT')

        var json_return = {
            status: true,
            data: rows
        }
        res.status(200).json(json_return)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            status: false
        }
        res.status(200).json(json_return)
    } finally {
        dbconn.release
    }
})

dashboard.get('/find_instalasi', async (req, res) => {

    try {
        await dbconn.query('BEGIN')

        var {
            rows
        } = await dbconn.query('SELECT * FROM instalasi')
        var json_return = {
            status: true,
            instalasi: rows
        }

        await dbconn.query('COMMIT')
        res.status(200).json(json_return)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            status: false
        }
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

function minutesToString(minutes) {
    var numdays = Math.floor(minutes / 1440)
    var numhours = Math.floor((minutes % 1440) / 60)
    var numminutes = Math.floor(((minutes % 1440) % 60))
    return numdays + ' hari ' + numhours + ' jam ' + numminutes + ' menit'
}

module.exports = dashboard
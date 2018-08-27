var express = require('express')
var laporan = express.Router()
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
laporan.use(cors())
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

laporan.use((req, res, next) => {
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
        if (decoded.logged_in && (decoded.kategori == 'user ipl' || decoded.kategori == 'admin')) {
            next()
        } else if (decoded.logged_in) {
            var fileName = 'forbidden400.html'
            res.sendFile(fileName, options, (err) => {
                if (err) {
                    console.log(err)
                }
            })
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

laporan.get('/', (req, res) => {
    var fileName = 'laporan.html'
    res.sendFile(fileName, options, (err) => {
        if (err) {
            console.log(err)
        }
    })
})

laporan.get('/find_sp/:id_instalasi/:dr_tahun/:ke_tanggal', async (req, res) => {

    var params = req.params
    var id_instalasi = params.id_instalasi
    var dr_tanggal = params.dr_tahun
    var ke_tanggal = params.ke_tanggal

    try {
        await dbconn.query('BEGIN')
        var {
            rows
        } = await dbconn.query('SELECT * FROM permintaan WHERE tanggal >= \'' + dr_tanggal + '\' and tanggal <= \'' + ke_tanggal + '\' and id_instalasi = \'' + id_instalasi + '\'');
        await dbconn.query('COMMIT')

        var response_json = {
            status: true,
            permintaan: rows
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
})


laporan.get('/find_spk/:id_instalasi/:dr_tahun/:ke_tanggal', async (req, res) => {

    var params = req.params
    var id_instalasi = params.id_instalasi
    var dr_tanggal = params.dr_tahun
    var ke_tanggal = params.ke_tanggal

    try {
        await dbconn.query('BEGIN')
        var {
            rows
        } = await dbconn.query('SELECT p.nomor_surat as nomor_sp, pk.nomor_surat as nomor_spk, p.tanggal, i.nama_instalasi, pk.lokasi, pk.tanggal_kembali, pk.keterangan FROM perintah_kerja pk JOIN permintaan p ON pk.id_permintaan = p.id_permintaan WHERE p.tanggal >= \'' + dr_tanggal + '\' and p.tanggal <= \'' + ke_tanggal + '\' and p.id_instalasi = \'' + id_instalasi + '\'');
        await dbconn.query('COMMIT')

        var response_json = {
            status: true,
            perintah_kerja: rows
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
})

function minutesToString(minutes) {
    var numdays = Math.floor(minutes / 1440)
    var numhours = Math.floor((minutes % 1440) / 60)
    var numminutes = Math.floor(((minutes % 1440) % 60))
    return numdays + ' hari ' + numhours + ' jam ' + numminutes + ' menit'
}

module.exports = laporan
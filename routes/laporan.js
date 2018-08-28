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

    var panjang_baris = req.query.length
    var awal_baris = req.query.start
    var order = req.query.order
    var order_kolom = order['0'].column;
    var tipe_order = order['0'].dir
    var draw = req.query.draw
    
    var kolom = ['p.nomor_surat', 'p.tanggal', 'i.nama_instalasi', 'p.nama_peminta', 'p.status']

    if (order_kolom == '') {
        order_kolom = 'p.id_permintaan'
        tipe_order = 'desc'
    } else {
        order_kolom = kolom[order_kolom]
    }

    var sql = '';
    var data = new Array()
    var recordsFiltered = 0
    var recordsTotal = 0

    try {
        await dbconn.query('BEGIN')

        if(id_instalasi == 'all'){
            sql = 'SELECT p.nomor_surat, p.tanggal, i.nama_instalasi, p.nama_peminta, p.status, pk.id_perintah_kerja FROM permintaan p LEFT JOIN perintah_kerja pk ON p.id_permintaan = pk.id_permintaan INNER JOIN instalasi i ON i.id_instalasi = p.id_instalasi WHERE p.tanggal >= \''+dr_tanggal+'\' and p.tanggal <= \''+ke_tanggal+'\' ORDER BY ' + order_kolom + ' ' + tipe_order + ' LIMIT ' + panjang_baris + ' OFFSET ' + awal_baris
        }else{
            sql = 'SELECT p.nomor_surat, p.tanggal, i.nama_instalasi, p.nama_peminta, p.status, pk.id_perintah_kerja FROM permintaan p LEFT JOIN perintah_kerja pk ON p.id_permintaan = pk.id_permintaan INNER JOIN instalasi i ON i.id_instalasi = p.id_instalasi WHERE p.tanggal >= \''+dr_tanggal+'\' and p.tanggal <= \''+ke_tanggal+'\' and i.id_instalasi = \''+id_instalasi+'\' ORDER BY ' + order_kolom + ' ' + tipe_order + ' LIMIT ' + panjang_baris + ' OFFSET ' + awal_baris
        }

        var {
            rows
        } = await dbconn.query(sql);
        var i = 0
        rows.forEach((item) => {
            var data_table = [item.nomor_surat, item.tanggal, item.nama_instalasi, item.nama_peminta, item.status];
            data[i] = data_table
            i++
        })
        
        if(id_instalasi == 'all'){
            sql = 'SELECT * FROM permintaan p INNER JOIN instalasi i ON i.id_instalasi = p.id_instalasi WHERE p.tanggal >= \''+dr_tanggal+'\' and p.tanggal <= \''+ke_tanggal+'\' ORDER BY ' + order_kolom
        }else{
            sql = 'SELECT * FROM permintaan p INNER JOIN instalasi i ON i.id_instalasi = p.id_instalasi WHERE p.tanggal >= \''+dr_tanggal+'\' and p.tanggal <= \''+ke_tanggal+'\' and i.id_instalasi = \''+id_instalasi+'\' ORDER BY ' + order_kolom
        }

        var {
            rows
        } = await dbconn.query(sql);
        recordsFiltered = rows.length;
        await dbconn.query('COMMIT')

        var response_json = {
            status: true,
            draw: draw,
            recordsFiltered: recordsFiltered,
            recordsTotal: recordsTotal,
            data: data
        }

        res.status(200).json(response_json)
    } catch (err) {
        var response_json = {
            status: false,
            draw: draw,
            recordsFiltered: recordsFiltered,
            recordsTotal: recordsTotal,
            data: data
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

    var panjang_baris = req.query.length
    var awal_baris = req.query.start
    var order = req.query.order
    var order_kolom = order['0'].column;
    var tipe_order = order['0'].dir
    var draw = req.query.draw

    var kolom = ['p.nomor_surat', 'pk.nomor_surat', 'p.tanggal', 'i.nama_instalasi', 'pk.lokasi', 'pk.tanggal_kembali', 'pk.keterangan', ]

    if(order_kolom == ''){
        order_kolom = 'p.id_pengguna'
        tipe_order = 'desc'
    }else{
        order_kolom = kolom[order_kolom]
    }

    var sql = '';
    var data = new Array()
    var recordsFiltered = 0
    var recordsTotal = 0

    try {
        await dbconn.query('BEGIN')

        if(id_instalasi == 'all'){
            sql = 'SELECT p.nomor_surat as nomor_sp, pk.nomor_surat as nomor_spk, p.tanggal, i.nama_instalasi, pk.lokasi, pk.tanggal_kembali, pk.keterangan FROM perintah_kerja pk JOIN permintaan p ON pk.id_permintaan = p.id_permintaan JOIN instalasi i ON i.id_instalasi = p.id_instalasi WHERE p.tanggal >= \'' + dr_tanggal + '\' and p.tanggal <= \'' + ke_tanggal + '\' ORDER BY ' + order_kolom + ' ' + tipe_order + ' LIMIT ' + panjang_baris + ' OFFSET ' + awal_baris
        }else{
            sql = 'SELECT p.nomor_surat as nomor_sp, pk.nomor_surat as nomor_spk, p.tanggal, i.nama_instalasi, pk.lokasi, pk.tanggal_kembali, pk.keterangan FROM perintah_kerja pk JOIN permintaan p ON pk.id_permintaan = p.id_permintaan JOIN instalasi i ON i.id_instalasi = p.id_instalasi WHERE p.tanggal >= \'' + dr_tanggal + '\' and p.tanggal <= \'' + ke_tanggal + '\' and p.id_instalasi = \'' + id_instalasi + '\' ORDER BY ' + order_kolom + ' ' + tipe_order + ' LIMIT ' + panjang_baris + ' OFFSET ' + awal_baris
        }

        var {
            rows
        } = await dbconn.query(sql);
        var i = 0
        rows.forEach((item) => {
            var data_table = [item.nomor_sp, item.nomor_spk, item.tanggal, item.nama_instalasi, item.lokasi, item.tanggal_kembali, item.keterangan];
            data[i] = data_table
            i++
        })
        
        if(id_instalasi == 'all'){
            sql = 'SELECT p.nomor_surat as nomor_sp, pk.nomor_surat as nomor_spk, p.tanggal, i.nama_instalasi, pk.lokasi, pk.tanggal_kembali, pk.keterangan FROM perintah_kerja pk JOIN permintaan p ON pk.id_permintaan = p.id_permintaan JOIN instalasi i ON i.id_instalasi = p.id_instalasi WHERE p.tanggal >= \'' + dr_tanggal + '\' and p.tanggal <= \'' + ke_tanggal + '\' ORDER BY ' + order_kolom + ' ' + tipe_order
        }else{
            sql = 'SELECT p.nomor_surat as nomor_sp, pk.nomor_surat as nomor_spk, p.tanggal, i.nama_instalasi, pk.lokasi, pk.tanggal_kembali, pk.keterangan FROM perintah_kerja pk JOIN permintaan p ON pk.id_permintaan = p.id_permintaan JOIN instalasi i ON i.id_instalasi = p.id_instalasi WHERE p.tanggal >= \'' + dr_tanggal + '\' and p.tanggal <= \'' + ke_tanggal + '\' and p.id_instalasi = \'' + id_instalasi + '\' ORDER BY ' + order_kolom + ' ' + tipe_order
        }

        var {
            rows
        } = await dbconn.query(sql);
        recordsFiltered = rows.length;
        await dbconn.query('COMMIT')
        
        var response_json = {
            status: true,
            draw: draw,
            recordsTotal : recordsTotal,
            recordsFiltered : recordsFiltered,
            data: data
        }

        res.status(200).json(response_json)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var response_json = {
            status: false,
            draw: draw,
            recordsTotal : recordsTotal,
            recordsFiltered : recordsFiltered,
            data: data
        }
        res.status(200).json(response_json)
    } finally {
        await dbconn.release
    }
})

laporan.get('/find_instalasi', async (req, res) => {

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

module.exports = laporan
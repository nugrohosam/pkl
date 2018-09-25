var express = require('express')
var permintaan = express.Router()
var cors = require('cors')
var dbconn = require('../database/database')
var jwt = require('jsonwebtoken')
var token;

var token = jwt.sign({
    data: {
        logged_in: false
    }
}, 'secret_token', {
    expiresIn: '1d'
})


permintaan.use(cors())
var options = {
    root: './src/views/'
}

var now = new Date();
var year = "" + now.getFullYear();
var month = "" + (now.getMonth() + 1);
if (month.length == 1) {
    month = "0" + month;
}
var day = "" + now.getDate();
if (day.length == 1) {
    day = "0" + day;
}
var hour = "" + now.getHours();
if (hour.length == 1) {
    hour = "0" + hour;
}
var minute = "" + now.getMinutes();
if (minute.length == 1) {
    minute = "0" + minute;
}
var second = "" + now.getSeconds();
if (second.length == 1) {
    second = "0" + second;
}

permintaan.use((req, res, next) => {
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

permintaan.get('/', (req, res) => {
    var fileName = 'permintaan.html'
    res.sendFile(fileName, options, (err) => {
        if (err) {
            console.log(err)
        }
    })
})

permintaan.post('/save', async (req, res) => {

    var datetime = Date.now()
    var id_permintaan = 'perm' + datetime
    var datetime_format = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;

    var data = req.body
    var nomor_surat = data.nomor_surat
    var tanggal = data.tanggal
    var id_instalasi = data.id_instalasi
    var nama_peminta = data.nama_peminta
    var buat_pada = datetime_format
    var ubah_pada = datetime_format
    var diterima = datetime_format
    var token = req.cookies.token
    var decoded = jwt.verify(token, 'secret_token')

    var detail = data.detail
    var panjang_detail = detail.length
    var sql

    if (decoded.kategori == 'user' || decoded.kategori == 'user ipl' || decoded.kategori == 'admin') {

        try {
            await dbconn.query('BEGIN')

            sql = 'INSERT INTO permintaan (id_permintaan, id_instalasi, nomor_surat, tanggal, nama_peminta, status, diterima, buat_pada, ubah_pada) VALUES (\'' + id_permintaan + '\', \'' + id_instalasi + '\', \'' + nomor_surat + '\', \'' + tanggal + '\', \'' + nama_peminta + '\', \'diterima\', \'' + diterima + '\', \'' + buat_pada + '\', \'' + ubah_pada + '\')';
            await dbconn.query(sql)

            sql = 'INSERT INTO detail_permintaan VALUES '
            for (i = 0; i < panjang_detail; i++) {
                if (i != (panjang_detail - 1)) {
                    sql = sql + '( \'' + id_permintaan + '\', \'' + detail[i][0] + '\', \'' + detail[i][1] + '\', \'' + detail[i][2] + '\', \'' + detail[i][3] + '\', ' + detail[i][4] + '), '
                } else {
                    sql = sql + '( \'' + id_permintaan + '\', \'' + detail[i][0] + '\', \'' + detail[i][1] + '\', \'' + detail[i][2] + '\', \'' + detail[i][3] + '\', ' + detail[i][4] + ') '
                }
            }
            await dbconn.query(sql)

            await dbconn.query('COMMIT')
            var json_return = {
                status: true
            }
            res.status(200).json(json_return)
        } catch (err) {
            await dbconn.query('ROLLBACK')
            console.log(err)
            var json_return = {
                satus: false
            }
            res.status(200).json(json_return)
        } finally {
            await dbconn.release
        }
    } else {
        var json_return = {
            satus: false
        }
        res.status(200).json(json_return)
    }
})

permintaan.get('/find', async (req, res) => {

    var panjang_baris = req.query.length
    var awal_baris = req.query.start
    var pencarian = req.query.search
    var isi_pencarian = pencarian['value']
    var order = req.query.order
    var order_kolom = order['0'].column;
    var tipe_order = order['0'].dir
    var draw = req.query.draw
    var token = req.cookies.token
    var decoded = jwt.verify(token, 'secret_token')

    var kolom = ['p.nomor_surat', 'p.tanggal', 'i.nama_instalasi', 'p.nama_peminta', 'p.status', 'p.validasi']

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

        sql = "SELECT p.id_permintaan, p.nomor_surat, p.tanggal, i.id_instalasi, i.nama_instalasi, p.nama_peminta, p.status, pk.id_perintah_kerja, p.validasi FROM permintaan p LEFT JOIN perintah_kerja pk ON p.id_permintaan = pk.id_permintaan INNER JOIN instalasi i ON i.id_instalasi = p.id_instalasi  WHERE ( p.nomor_surat LIKE '%" + isi_pencarian + "%' OR p.tanggal LIKE '%" + isi_pencarian + "%' OR i.nama_instalasi LIKE '%" + isi_pencarian + "%' OR p.nama_peminta LIKE '%" + isi_pencarian + "%' OR p.status LIKE '%" + isi_pencarian + "%' OR p.validasi LIKE '%" + isi_pencarian + "%') ORDER BY " + order_kolom + " " + tipe_order + " LIMIT " + panjang_baris + " OFFSET " + awal_baris
        var {
            rows
        } = await dbconn.query(sql)
        var i = 0

        var operator = decoded.kategori.split(' ')

        if (operator[0] == 'operator') {
            rows.forEach((item) => {
                if (item.id_instalasi == operator[1]) {
                    var script_html = ''

                    if (item.status == 'selesai' && item.validasi == null) {
                        script_html = ' <i class="left fa fa-check" style="cursor : pointer" onClick="validasi_proccess(\'' + item.id_permintaan + '\' , \'selesai\')"></i><span style="cursor : pointer" onClick="validasi_proccess(\'' + item.id_permintaan + '\' , \'selesai\')"> Selesai</span> <i class="left fa fa-close" style="cursor : pointer" onClick="validasi_proccess(\'' + item.id_permintaan + '\' , \'tidak\')"></i><span style="cursor : pointer" onClick="validasi_proccess(\'' + item.id_permintaan + '\', \'tidak\')"> Tidak</span>'
                    }

                    var data_table = [item.nomor_surat, item.tanggal, item.nama_instalasi, item.nama_peminta, item.status, item.validasi, script_html]
                    data[i] = data_table
                    i++
                }
            })
        } else {
            rows.forEach((item) => {
                var script_html = '<i class="left fa fa-pencil" style="cursor : pointer" onClick="ubah_modal(\'' + item.id_permintaan + '\')"></i><span style="cursor : pointer" onClick="ubah_modal(\'' + item.id_permintaan + '\')"> Edit</span> <i class="left fa fa-eye" style="cursor : pointer" onClick="detail_modal(\'' + item.id_permintaan + '\')"></i><span style="cursor : pointer" onClick="detail_modal(\'' + item.id_permintaan + '\')"> Detail</span>'

                if (item.status == 'selesai') {
                    script_html = '<i class="left fa fa-eye" style="cursor : pointer" onClick="detail_modal(\'' + item.id_permintaan + '\')"></i><span style="cursor : pointer" onClick="detail_modal(\'' + item.id_permintaan + '\')"> Detail</span>'
                }

                if ((decoded.kategori == 'user ipl' || decoded.kategori == 'admin') && item.id_perintah_kerja == null) {
                    script_html = script_html + ' <i class="left fa fa-sticky-note" style="cursor : pointer" onClick="tambah_spk_modal(\'' + item.nomor_surat + '\')"></i><span style="cursor : pointer" onClick="tambah_spk_modal(\'' + item.nomor_surat + '\')"> Buat SPK</span>'
                }

                var data_table = [item.nomor_surat, item.tanggal, item.nama_instalasi, item.nama_peminta, item.status, item.validasi, script_html]
                data[i] = data_table
                i++
            })
        }

        sql = "SELECT * FROM permintaan p INNER JOIN instalasi i ON p.id_instalasi = i.id_instalasi"
        rows = await dbconn.query(sql)
        recordsTotal = rows.rowCount

        sql = "SELECT * FROM permintaan p INNER JOIN instalasi i ON i.id_instalasi = p.id_instalasi WHERE ( p.nomor_surat LIKE '%" + isi_pencarian + "%' OR p.tanggal LIKE '%" + isi_pencarian + "%' OR i.nama_instalasi LIKE '%" + isi_pencarian + "%' OR p.nama_peminta LIKE '%" + isi_pencarian + "%') ORDER BY " + order_kolom
        var {
            rows
        } = await dbconn.query(sql)
        recordsFiltered = rows.length

        await dbconn.query('COMMIT')
        var json_return = {
            draw: draw,
            recordsTotal: recordsTotal,
            recordsFiltered: recordsFiltered,
            data: data
        }
        res.status(200).json(json_return)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            draw: draw,
            recordsTotal: recordsTotal,
            recordsFiltered: recordsFiltered,
            data: data
        }
        res.status(400).json(json_return)
    } finally {
        await dbconn.release
    }
})

permintaan.get('/find/:id', async (req, res) => {

    var id = req.params.id
    var sql

    try {
        await dbconn.query('BEGIN')

        sql = 'SELECT p.id_permintaan, p,nomor_surat, p.tanggal, b.id_bidang, i.id_instalasi, p.nama_peminta, p.status, p.diterima, p.dikerjakan, p.selesai FROM permintaan p INNER JOIN instalasi i ON i.id_instalasi = p.id_instalasi INNER JOIN bidang b ON b.id_bidang = i.id_bidang WHERE p.id_permintaan = \'' + id + '\''
        var {
            rows
        } = await dbconn.query(sql)
        var json_return = {
            status: true,
            id_permintaan: rows[0].id_permintaan,
            nomor_surat: rows[0].nomor_surat,
            tanggal: rows[0].tanggal,
            id_instalasi: rows[0].id_instalasi,
            id_bidang: rows[0].id_bidang,
            nama_peminta: rows[0].nama_peminta,
            status_permintaan: rows[0].status,
            diterima: rows[0].diterima,
            dikerjakan: rows[0].dikerjakan,
            selesai: rows[0].selesai,
            detail: []
        }

        sql = 'SELECT * FROM detail_permintaan WHERE id_permintaan = \'' + id + '\''
        var {
            rows
        } = await dbconn.query(sql)
        json_return.detail = rows

        await dbconn.query('COMMIT')
        res.status(200).json(json_return)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            satus: false
        }
        res.status(400).json(json_return)
    } finally {
        await dbconn.release
    }
})

permintaan.post('/update/:id', async (req, res) => {

    var id_permintaan = req.params.id
    var datetime_format = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;

    var data = req.body
    var nomor_surat = data.nomor_surat
    var tanggal = data.tanggal
    var id_instalasi = data.id_instalasi
    var nama_peminta = data.nama_peminta
    var status = data.status
    var ubah_pada = datetime_format
    var token = req.cookies.token
    var decoded = jwt.verify(token, 'secret_token')

    var detail = data.detail
    var panjang_detail = detail.length
    var sql


    if (decoded.kategori == 'user' || decoded.kategori == 'user ipl' || decoded.kategori == 'admin') {
        try {

            await dbconn.query('BEGIN')

            sql = 'UPDATE permintaan SET nomor_surat = \'' + nomor_surat + '\', tanggal =  \'' + tanggal + '\', id_instalasi = \'' + id_instalasi + '\', nama_peminta = \'' + nama_peminta + '\', status = \'' + status + '\', ubah_pada = \'' + ubah_pada + '\' WHERE id_permintaan = \'' + id_permintaan + '\' AND dikerjakan is null AND diterima is not null';

            if (status == 'dikerjakan') {
                var dikerjakan = datetime_format
                sql = 'UPDATE permintaan SET nomor_surat = \'' + nomor_surat + '\', tanggal =  \'' + tanggal + '\', id_instalasi = \'' + id_instalasi + '\', nama_peminta = \'' + nama_peminta + '\', status = \'' + status + '\', dikerjakan = \'' + dikerjakan + '\', ubah_pada = \'' + ubah_pada + '\' WHERE id_permintaan = \'' + id_permintaan + '\' AND diterima is not null AND selesai is null';
            }

            if (status == 'selesai') {
                var selesai = datetime_format
                sql = 'UPDATE permintaan SET nomor_surat = \'' + nomor_surat + '\', tanggal =  \'' + tanggal + '\', id_instalasi = \'' + id_instalasi + '\', nama_peminta = \'' + nama_peminta + '\', status = \'' + status + '\', selesai = \'' + selesai + '\', ubah_pada = \'' + ubah_pada + '\' WHERE id_permintaan = \'' + id_permintaan + '\' AND diterima is not null AND dikerjakan is not null AND selesai is null';
            }
            await dbconn.query(sql)

            sql = 'DELETE FROM detail_permintaan WHERE id_permintaan = \'' + id_permintaan + '\''
            await dbconn.query(sql)

            sql = 'INSERT INTO detail_permintaan VALUES '
            for (i = 0; i < panjang_detail; i++) {
                if (i != (panjang_detail - 1)) {
                    sql = sql + '( \'' + id_permintaan + '\', \'' + detail[i][0] + '\', \'' + detail[i][1] + '\', \'' + detail[i][2] + '\', \'' + detail[i][3] + '\', ' + detail[i][4] + '), '
                } else {
                    sql = sql + '( \'' + id_permintaan + '\', \'' + detail[i][0] + '\', \'' + detail[i][1] + '\', \'' + detail[i][2] + '\', \'' + detail[i][3] + '\', ' + detail[i][4] + ') '
                }

            }
            await dbconn.query(sql)

            await dbconn.query('COMMIT')
            var json_return = {
                status: true
            }
            res.status(200).json(json_return)
        } catch (err) {
            await dbconn.query('ROLLBACK')
            var json_return = {
                status: false
            }
            res.status(400).json(json_return)
        } finally {
            await dbconn.release
        }
    } else {
        var json_return = {
            status: false
        }
        res.status(400).json(json_return)
    }
})

permintaan.get('/find_instalasi_with_id_bidang/:id', async (req, res) => {

    var id = req.params.id
    try {
        await dbconn.query('BEGIN')

        var sql = 'SELECT * FROM instalasi i INNER JOIN bidang b ON i.id_bidang = b.id_bidang WHERE i.id_bidang = \'' + id + '\''
        var {
            rows
        } = await dbconn.query(sql)

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

permintaan.post('/validasi/:id', async (req, res) => {

    var data = req.body
    var id_permintaan = req.params.id
    var validasi = data.validasi
    var decoded = jwt.verify(token, 'secret_token')
    var operator = decoded.kategori.split(' ')

    if (operator[0] == 'operator') {
        try {
            await dbconn.query('BEGIN')

            var sql = 'UPDATE permintaan SET validasi = \'' + validasi + '\' WHERE id_permintaan = \'' + id_permintaan + '\''

            await dbconn.query(sql)

            var json_return = {
                status: true
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
    } else {
        var json_return = {
            status: false
        }
        res.status(200).json(json_return)
    }
})

permintaan.get('/find_bidang', async (req, res) => {

    try {
        await dbconn.query('BEGIN')

        var sql = 'SELECT * FROM bidang'
        var {
            rows
        } = await dbconn.query(sql)

        var json_return = {
            status: true,
            bidang: rows
        }

        await dbconn.query('COMMIT')
        res.status(200).json(json_return)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            status: false,
            mssg: err
        }
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

module.exports = permintaan;
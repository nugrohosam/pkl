var express = require('express')
var perintah_kerja = express.Router()
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
perintah_kerja.use(cors())
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

perintah_kerja.use((req, res, next) => {
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

perintah_kerja.get('/', (req, res) => {
    var fileName = 'perintah_kerja.html'
    res.sendFile(fileName, options, (err) => {
        if (err) {
            console.log(err)
        }
    })
})

perintah_kerja.post('/save', async (req, res) => {

    var datetime = Date.now()
    var id_perintah_kerja = 'peri' + datetime
    var datetime_format = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;

    var data = req.body
    var id_permintaan = data.id_permintaan
    var nomor_surat = data.nomor_surat
    var lokasi = data.lokasi
    var buat_pada = datetime_format
    var ubah_pada = datetime_format
    var detail_staff_ipl = data.staff_ipl
    var panjang_detail_staff_ipl = detail_staff_ipl.length
    var detail_jenis_perintah = data.jenis_perintah
    var panjang_detail_jenis_perintah = detail_jenis_perintah.length
    var sql
    var i

    try {
        await dbconn.query('BEGIN')

        await dbconn.query('INSERT INTO perintah_kerja ( id_perintah_kerja, id_permintaan, nomor_surat, lokasi, buat_pada, ubah_pada ) VALUES ( \'' + id_perintah_kerja + '\', \'' + id_permintaan + '\', \'' + nomor_surat + '\', \'' + lokasi + '\', \'' + buat_pada + '\', \'' + ubah_pada + '\')')

        sql = 'INSERT INTO staff_ipl_perintah_kerja VALUES '
        for (i = 0; i < panjang_detail_staff_ipl; i++) {
            if (i != (panjang_detail_staff_ipl - 1)) {
                sql = sql + '( \'' + id_perintah_kerja + '\', \'' + detail_staff_ipl[i][0] + '\'), '
            } else {
                sql = sql + '( \'' + id_perintah_kerja + '\', \'' + detail_staff_ipl[i][0] + '\') '
            }
        }
        await dbconn.query(sql)

        sql = 'INSERT INTO jenis_perintah_perintah_kerja VALUES '
        for (i = 0; i < panjang_detail_jenis_perintah; i++) {
            if (i != (panjang_detail_jenis_perintah - 1)) {
                sql = sql + '( \'' + id_perintah_kerja + '\', \'' + detail_jenis_perintah[i][0] + '\'), '
            } else {
                sql = sql + '( \'' + id_perintah_kerja + '\', \'' + detail_jenis_perintah[i][0] + '\') '
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
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }

})

perintah_kerja.get('/find', async (req, res) => {

    var panjang_baris = req.query.length
    var awal_baris = req.query.start
    var pencarian = req.query.search
    var isi_pencarian = pencarian['value']
    var order = req.query.order
    var order_kolom = order['0'].column;
    var tipe_order = order['0'].dir
    var draw = req.query.draw

    var kolom = ['p.nomor_surat', 'pk.nomor_surat', 'p.tanggal', 'i.nama_instalasi', 'pk.lokasi', 'pk.tanggal_kembali', 'pk.keterangan', ]

    if (order_kolom == '') {
        order_kolom = 'id_perintah_kerja'
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

        sql = "SELECT pk.id_perintah_kerja, p.nomor_surat as nomor_sp, pk.nomor_surat as nomor_spk, p.tanggal, i.nama_instalasi, pk.lokasi, pk.keterangan, pk.tanggal_kembali FROM perintah_kerja pk INNER JOIN permintaan p ON pk.id_permintaan = p.id_permintaan INNER JOIN instalasi i ON i.id_instalasi = p.id_instalasi WHERE ( p.nomor_surat LIKE '%" + isi_pencarian + "%' OR pk.nomor_surat LIKE '%" + isi_pencarian + "%' OR p.tanggal LIKE '%" + isi_pencarian + "%' OR i.nama_instalasi LIKE '%" + isi_pencarian + "%' OR pk.lokasi LIKE '%" + isi_pencarian + "%' OR pk.tanggal_kembali LIKE '%" + isi_pencarian + "%' ) ORDER BY " + order_kolom + " " + tipe_order + " LIMIT " + panjang_baris + " OFFSET " + awal_baris
        var {
            rows
        } = await dbconn.query(sql)
        var i = 0
        rows.forEach((item) => {
            var script_html = '<i class="left fa fa-pencil" style="cursor : pointer" onClick="ubah_modal(\'' + item.id_perintah_kerja + '\')"></i><span style="cursor : pointer" onClick="ubah_modal(\'' + item.id_perintah_kerja + '\')"> Edit</span> <i class="left fa fa-eye" style="cursor : pointer" onClick="detail_modal(\'' + item.id_perintah_kerja + '\')"></i><span style="cursor : pointer" onClick="detail_modal(\'' + item.id_perintah_kerja + '\')"> Detail</span> <i class="left fa fa-print" style="cursor : pointer" onClick="to_pdf_modal(\'' + item.id_perintah_kerja + '\')"></i><span style="cursor : pointer" onClick="to_pdf_modal(\'' + item.id_perintah_kerja + '\')"> Pdf</span>'

            var data_table = [item.nomor_sp, item.nomor_spk, item.tanggal, item.nama_instalasi, item.lokasi, item.tanggal_kembali, item.keterangan, script_html]
            data[i] = data_table
            i++
        })

        sql = "SELECT * FROM perintah_kerja pk"
        rows = await dbconn.query(sql)
        recordsTotal = rows.rowCount

        sql = "SELECT * FROM perintah_kerja pk INNER JOIN permintaan p ON p.id_permintaan = pk.id_permintaan INNER JOIN instalasi i ON i.id_instalasi = p.id_instalasi WHERE ( p.nomor_surat LIKE '%" + isi_pencarian + "%' OR pk.nomor_surat LIKE '%" + isi_pencarian + "%' OR p.tanggal LIKE '%" + isi_pencarian + "%' OR i.nama_instalasi LIKE '%" + isi_pencarian + "%' OR pk.lokasi LIKE '%" + isi_pencarian + "%' OR pk.tanggal_kembali LIKE '%" + isi_pencarian + "%' ) ORDER BY " + order_kolom
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
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

perintah_kerja.get('/find/:id', async (req, res) => {

    var id_perintah_kerja = req.params.id

    var id_perintah_kerja
    var nomor_sp
    var nomor_spk
    var tanggal
    var nama_instalasi
    var lokasi
    var tanggal_kembali
    var keterangan
    var staff_ipl
    var jenis_perintah
    var permintaan

    try {
        await dbconn.query('BEGIN')

        var {
            rows
        } = await dbconn.query('SELECT pk.id_perintah_kerja, p.id_permintaan, p.nomor_surat as nomor_sp, pk.nomor_surat as nomor_spk, p.tanggal, i.nama_instalasi, pk.lokasi, pk.tanggal_kembali, pk.keterangan FROM perintah_kerja pk INNER JOIN permintaan p ON p.id_permintaan = pk.id_permintaan INNER JOIN instalasi i ON i.id_instalasi = p.id_instalasi WHERE pk.id_perintah_kerja = \'' + id_perintah_kerja + '\'')
        id_perimntah_kerja = rows[0].id_perintah_kerja
        nomor_sp = rows[0].nomor_sp
        nomor_spk = rows[0].nomor_spk
        tanggal = rows[0].tanggal
        nama_instalasi = rows[0].nama_instalasi
        lokasi = rows[0].lokasi
        tanggal_kembali = rows[0].tanggal_kembali
        keterangan = rows[0].keterangan

        var {
            rows
        } = await dbconn.query('SELECT dp.permintaan, dp.huruf, dp.jumlah, dp.prioritas, dp.keterangan FROM detail_permintaan dp INNER JOIN permintaan p ON dp.id_permintaan = p.id_permintaan INNER JOIN perintah_kerja pk ON pk.id_permintaan = p.id_permintaan WHERE pk.id_perintah_kerja = \'' + id_perintah_kerja + '\'')
        permintaan = rows

        var { rows } = await dbconn.query('SELECT si.id_staff_ipl, si.nama, si.nip FROM staff_ipl_perintah_kerja sipk JOIN staff_ipl si ON sipk.id_staff_ipl = si.id_staff_ipl WHERE sipk.id_perintah_kerja = \''+id_perintah_kerja+'\'');
        staff_ipl = rows;

        var { rows } = await dbconn.query('SELECT * FROM jenis_perintah_perintah_kerja WHERE id_perintah_kerja = \''+id_perintah_kerja+'\'');
        jenis_perintah = rows;
        
        var json_return = {
            status: true,
            id_perintah_kerja: id_perintah_kerja,
            nomor_sp: nomor_sp,
            nomor_spk: nomor_spk,
            tanggal: tanggal,
            nama_instalasi: nama_instalasi,
            lokasi: lokasi,
            tanggal_kembali: tanggal_kembali,
            keterangan: keterangan,
            permintaan: permintaan,
            staff_ipl: staff_ipl,
            jenis_perintah: jenis_perintah
        }

        await dbconn.query('COMMIT')
        res.status(200).json(json_return)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            status: false,
            err : err
        }
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

perintah_kerja.post('/update/:id', async (req, res) => {

    var id_perintah_kerja = req.params.id
    var datetime_format = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;

    var data = req.body
    var id_permintaan = data.id_permintaan
    var nomor_surat = data.nomor_surat
    var lokasi = data.lokasi
    var tanggal_kembali = data.tanggal_kembali
    var keterangan = data.keterangan
    var ubah_pada = datetime_format
    var staff_ipl = data.staff_ipl
    var panjang_staff_ipl = staff_ipl.length
    var jenis_perintah = data.jenis_perintah
    var panjang_jenis_perintah = jenis_perintah.length

    try {
        await dbconn.query('BEGIN')

        await dbconn.query('UPDATE perintah_kerja SET id_permintaan = \'' + id_permintaan + '\', nomor_surat = \'' + nomor_surat + '\', lokasi = \'' + lokasi + '\', tanggal_kembali = \'' + tanggal_kembali + '\', keterangan = \'' + keterangan + '\', ubah_pada = \'' + ubah_pada + '\' WHERE id_perintah_kerja = \'' + id_perintah_kerja + '\'')
        
        await dbconn.query('DELETE FROM staff_ipl_perintah_kerja WHERE id_perintah_kerja = \''+id_perintah_kerja+'\'');
        await dbconn.query('DELETE FROM jenis_perintah_perintah_kerja WHERE id_perintah_kerja = \''+id_perintah_kerja+'\'');
        
        sql = 'INSERT INTO staff_ipl_perintah_kerja VALUES '
        for (i = 0; i < panjang_staff_ipl; i++) {
            if (i != (panjang_staff_ipl - 1)) {
                sql = sql + '( \'' + id_perintah_kerja + '\', \'' + staff_ipl[i][0] + '\'), '
            } else {
                sql = sql + '( \'' + id_perintah_kerja + '\', \'' + staff_ipl[i][0] + '\') '
            }

        }
        await dbconn.query(sql)

        sql = 'INSERT INTO jenis_perintah_perintah_kerja VALUES '
        for (i = 0; i < panjang_jenis_perintah; i++) {
            if (i != (panjang_jenis_perintah - 1)) {
                sql = sql + '( \'' + id_perintah_kerja + '\', \'' + jenis_perintah[i][0] + '\'), '
            } else {
                sql = sql + '( \'' + id_perintah_kerja + '\', \'' + jenis_perintah[i][0] + '\') '
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
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

perintah_kerja.get('/find_permintaan/:nomor_surat', async (req, res) => {

    var nomor_surat = req.params.nomor_surat
    var sql

    try {
        await dbconn.query('BEGIN')

        sql = 'SELECT p.id_permintaan FROM permintaan p LEFT JOIN perintah_kerja pk ON p.id_permintaan = pk.id_permintaan WHERE p.nomor_surat = \'' + nomor_surat + '\' and pk.id_permintaan is null'
        var {
            rows
        } = await dbconn.query(sql)
        var json_return = {
            status: true,
            id_permintaan: rows[0].id_permintaan
        }

        await dbconn.query('COMMIT')
        res.status(200).json(json_return)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            satus: false
        }
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

perintah_kerja.get('/find_permintaan_update_proccess/:nomor_surat', async (req, res) => {

    var nomor_surat = req.params.nomor_surat
    var sql

    try {
        await dbconn.query('BEGIN')

        sql = 'SELECT p.id_permintaan FROM permintaan p LEFT JOIN perintah_kerja pk ON p.id_permintaan = pk.id_permintaan WHERE p.nomor_surat = \'' + nomor_surat + '\''
        var {
            rows
        } = await dbconn.query(sql)
        var json_return = {
            status: true,
            id_permintaan: rows[0].id_permintaan
        }

        await dbconn.query('COMMIT')
        res.status(200).json(json_return)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            satus: false
        }
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

perintah_kerja.get('/go_pdf/:id_perintah_kerja/:tipe', async (req, res) => {
    var fileName = 'perintah_kerja_to_pdf.html'
    res.sendFile(fileName, options, (err) => {
        if (err) {
            console.log(err)
        }
    })
})

perintah_kerja.get('/find_nomor_sp', async (req, res) => {

    try {
        await dbconn.query('BEGIN')

        sql = 'SELECT p.nomor_surat, pk.id_permintaan FROM permintaan p LEFT JOIN perintah_kerja pk ON p.id_permintaan = pk.id_permintaan'
        var {
            rows
        } = await dbconn.query(sql)
        var data = new Array()
        var i = 0
        rows.forEach((item) => {
            if (item.id_permintaan == null) {
                data[i] = item.nomor_surat
                i++
            }
        })
        var json_return = {
            status: true,
            nomor_sp: data
        }

        await dbconn.query('COMMIT')
        res.status(200).json(json_return)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            satus: false
        }
        res.status(400).json(json_return)
    } finally {
        await dbconn.relese
    }
})

perintah_kerja.get('/count_spk/:tahun/:bulan', async (req, res) => {

    var tahun = req.params.tahun
    var bulan = req.params.tahun
    
    try {
        await dbconn.query('BEGIN')

        sql = 'select count(*) as jumlah from perintah_kerja where date_part(\'year\', buat_pada) = \''+tahun+'\' and date_part(\'month\', buat_pada) = \''+bulan+'\'';
        var {
            rows
        } = await dbconn.query(sql)
        var json_return = {
            status: true,
            jumlah: rows[0].jumlah
        }

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

perintah_kerja.get('/find_staff_ipl', async (req, res) => {
    try {
        await dbconn.query('BEGIN')

        sql = 'SELECT id_staff_ipl, nama, nip FROM staff_ipl'
        var {
            rows
        } = await dbconn.query(sql)
        var json_return = {
            status: true,
            staff_ipl: rows
        }

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

module.exports = perintah_kerja;
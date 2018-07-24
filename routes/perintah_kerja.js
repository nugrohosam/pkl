var express = require('express')
var perintah_kerja = express.Router()
var cors = require('cors')
var dbconn = require('../database/database')
var jwt = require('jsonwebtoken')
var token;

var token = jwt.sign({ data: {logged_in : false}}, 'secret_token', { expiresIn: '1d' })
perintah_kerja.use(cors())
var appData = {}
var options = {
    root: './src/views/'
}


perintah_kerja.use((req, res, next) => {
    if(!req.cookies.token){
        var fileName = 'login.html'
            res.sendfile(fileName, options, (err) => {
                if(err){
                    console.log(err)
                }  
        })
    }else{
        token = req.cookies.token
        var decoded = {
            logged_in : false
        }
        
        try {
            decoded = jwt.verify(token, 'secret_token')
        }
        catch (error) {
            var fileName = 'login.html'
            res.sendfile(fileName, options, (err) => {
                if(err){
                    console.log(err)
                }  
            })
        }

        if(decoded.logged_in && decoded.kategori == 'user ipl'){
            next()
        }else{
            var fileName = 'login.html'
            res.sendfile(fileName, options, (err) => {
                if(err){
                    console.log(err)
                }  
            })
        }
    }
})

perintah_kerja.get('/', (req, res) => {
    var fileName = 'perintah_kerja.html'
    res.sendfile(fileName, options, (err) => {
        if(err){
            console.log(err)
        }  
    })
})

perintah_kerja.post('/save', async (req, res) => {
    
    var datetime = Date.now()
    var id_perintah_kerja = 'peri'+datetime
    
    var data = req.body
    var id_permintaan = data.id_permintaan
    var lokasi = data.lokasi
    
    try{
        await dbconn.query('BEGIN')

        await dbconn.query('INSERT INTO perintah_kerja ( id_perintah_kerja, id_permintaan, lokasi ) VALUES ( \''+id_perintah_kerja+'\', \''+id_permintaan+'\', \''+lokasi+'\')')
        await dbconn.query('COMMIT')
        var json_return = {
            status : false
        }
        res.status(200).json(json_return)
    } catch(err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            status : false
        }
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
    
})

perintah_kerja.get('/find/:id', async (req, res) => {
    
    var panjang_baris = req.query.length
    var awal_baris = req.query.start
    var pencarian = req.query.search
    var isi_pencarian = pencarian['value']
    var order = req.query.order
    var order_kolom = order['0'].column;
    var tipe_order = order['0'].dir
    var draw = req.query.draw
    
    var kolom = ['p.nomor_surat', 'pk.nomor_surat', 'p.tanggal', 'i.nama_instalasi', 'pk.lokasi', 'pk.tanggal_kembali']

    if(order_kolom == '0'){
        order_kolom = 'id_perintah_kerja'
        tipe_order = 'desc'
    }else{
        order_kolom = kolom[order_kolom]
    }

    var sql = '';
    var data = new Array()
    var recordsFiltered = 0
    var recordsTotal = 0

    try{
        await dbconn.query('BEGIN')
        
        sql = "SELECT pk.id_perintah_kerja, p.nomor_surat as nomor_sp, pk.nomor_surat as nomor_spk, p.tanggal, i.nama_instalasi, pk.lokasi, pk.tanggal_kembali FROM perintah_kerja pk INNER JOIN permintaan p ON pk.id_permintaan = p.id_permintaan INNER JOIN instalasi i ON i.id_instalasi = p.id_instalasi WHERE ( p.nomor_surat LIKE '%"+isi_pencarian+"%' OR pk.nomor_surat LIKE '%"+isi_pencarian+"%' OR p.tanggal LIKE '%"+isi_pencarian+"%' OR i.nama_instalasi LIKE '%"+isi_pencarian+"%' OR pk.lokasi LIKE '%"+isi_pencarian+"%' OR pk.tanggal_kembali LIKE '%"+isi_pencarian+"%' ) ORDER BY "+order_kolom+" "+tipe_order+" LIMIT "+panjang_baris+" OFFSET "+awal_baris
        var { rows } = await dbconn.query(sql)
        var i = 0
        rows.forEach((item) => {
            var script_html = '<i class="left fa fa-pencil" style="cursor : pointer" onClick="ubah_modal(\''+item.id_permintaan+'\')"></i><span style="cursor : pointer" onClick="ubah_modal(\''+item.id_permintaan+'\')"> Edit</span> <i class="left fa fa-eye" style="cursor : pointer" onClick="detail_modal(\''+item.id_permintaan+'\')"></i><span style="cursor : pointer" onClick="detail_modal(\''+item.id_permintaan+'\')"> Detail</span>'
            
            if(item.status == 'selesai') {
                script_html = '<i class="left fa fa-eye" style="cursor : pointer" onClick="detail_modal(\''+item.id_permintaan+'\')"></i><span style="cursor : pointer" onClick="detail_modal(\''+item.id_permintaan+'\')"> Detail</span>'
            }
            var data_table = [item.nomor_sp, item.nomor_spk, item.tanggal, item.nama_instalasi, item.lokasi, item.tanggal_kembali, script_html]
            data[i] = data_table
            i++
        })

        sql = "SELECT * FROM perintah_kerja pk"
        rows = await dbconn.query(sql)
        recordsTotal = rows.rowCount
        
        sql = "SELECT * FROM perintah_kerja pk INNER JOIN permintaan p ON p.id_permintaan = pk.id_permintaan INNER JOIN instalasi i ON i.id_instalasi = p.id_instalasi WHERE ( p.nomor_surat LIKE '%"+isi_pencarian+"%' OR pk.nomor_surat LIKE '%"+isi_pencarian+"%' OR p.tanggal LIKE '%"+isi_pencarian+"%' OR i.nama_instalasi LIKE '%"+isi_pencarian+"%' OR pk.lokasi LIKE '%"+isi_pencarian+"%' OR pk.tanggal_kembali LIKE '%"+isi_pencarian+"%' ) ORDER BY "+order_kolom
        var { rows } = await dbconn.query(sql)
        recordsFiltered = rows.length

        await client.query('COMMIT')
        var json_return = {
            draw : draw,
            recordsTotal : recordsTotal,
            recordsFiltered : recordsFiltered,
            data : data
        }
        res.status(200).json(json_return)
    } catch (err){
        await dbconn.query('ROLLBACK')
        var json_return = {
            draw : draw,
            recordsTotal : recordsTotal,
            recordsFiltered : recordsFiltered,
            data : data
        }
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

perintah_kerja.get('/find/:id', async (req, res) => {

    var id_perintah_kerja = req.params.id
    
    var nomor_sp
    var nomor_spk
    var tanggal 
    var nama_instalasi
    var loakasi
    var tanggal_kembali
    var keterangan
    var data = new Array()

    try {
        await dbconn.query('BEGIN')

        var { rows } = await dbconn.query('SELECT pk.id_perintah_kerja, p.id_permintaan, p.nomor_surat as nomor_sp, pk.nomor_surat as nomor_spk, p.tanggal, i.nama_instalasi, pk.lokasi, pk.tanggal_kembali, pk.keterangan FROM perintah_kerja pk INNER JOIN permintaan p ON p.id_permintaan = pk.id_permintaan INNER JOIN instalasi i ON i.id_instalasi = p.id_instalasi WHERE pk.id_perintah_kerja = \''+id_perintah_kerja+'\'')
        nomor_sp = rows[0].nomor_sp
        nomor_spk = rows[0].nomor_spk
        tanggal = rows[0].tanggal
        nama_instalasi = rows[0].nama_instalasi
        lokasi = rows[0].loakasi
        tanggal_kembali = rows[0].tanggal_kembali
        keterangan = rows[0].keterangan

        var { rows } = await dbconn.query('SELECT dp.permintaan, dp.huruf, dp.jumlah, dp.keterangan FROM detail_permintaan dp INNER JOIN permintaan p ON dp.id_permintaan = p.id_permintaan INNER JOIN perintah_kerja pk ON pk.id_permintaan = p.id_permintaan WHERE pk.id_perintah_kerja = \''+id_perintah_kerja+'\'')
        var i = 0

        var json_return = {
            status : true,
            nomor_sp : nomor_sp,
            nomor_spk : nomor_spk,
            tanggal : tanggal,
            nama_instalasi : nama_instalasi,
            lokasi : loakasi, 
            tanggal_kembali : tanggal_kembali,
            keterangan : keterangan,
            permintaan : rows
        }
        
        await dbconn.query('COMMIT')
        res.status(200).json(json_return)
    } catch(err) {
        await dbconn.query('ROLLBACK')
        var json_return = {
            status : false
        }
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

perintah_kerja.post('/update/:id', async (req, res) => {

    var id_perintah_kerja = req.params.id
    
    var data = req.body
    var id_permintaan = data.id_permintaan
    var lokasi = data.lokasi
    var tanggal_kembali = data.tanggal_kembali
    var keterangan = data.keterangan

    try {
        await dbconn.query('BEGIN')

        await dbconn.query('UPDATE perintah_kerja SET id_permintaan = \''+id_permintaan+'\', lokasi = \''+lokasi+'\', tanggal_kembali = \''+tanggal_kembali+'\', keterangan = \''+keterangan+'\' WHERE id_perintah_kerja = \''+id_perintah_kerja+'\'')
        
        await dbconn.query('COMMIT')
        var json_return = {
            status : true
        }
        res.status(200).json(json_return)
    } catch(err) {
        var json_return = {
            status : false
        }
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

perintah_kerja.get('/find_permintaan/:nomor_surat', async (req, res) => {

    var nomor_surat = req.params.nomor_surat
    var sql

    try{
        await dbconn.query('BEGIN')

        sql = 'SELECT id_permintaan FROM permintaan WHERE nomor_surat = \''+nomor_surat+'\''
        var { rows } = await dbconn.query(sql)
        var json_return = {
            status : true,
            id_permintaan : rows[0].id_permintaan
        }

        await dbconn.query('COMMIT')
        res.status(200).json(json_return)
    } catch (err) {
        await dbconn.query('ROLLBACK')
        var json_return = {satus : false}
        res.status(400).json(json_return)
    } finally {
        await dbconn.release
    }
})

module.exports = perintah_kerja;
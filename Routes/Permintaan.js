var express = require('express')
var permintaan = express.Router()
var cors = require('cors')
var dbconn = require('../database/database')
var jwt = require('jsonwebtoken')
var token;

var token = jwt.sign({ data: {logged_in : false}}, 'secret_token', { expiresIn: '1d' })
permintaan.use(cors())
var appData = {}
var options = {
    root: './src/views/'
}

var now = new Date();
var year = "" + now.getFullYear();
var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
var day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
var hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
var minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
var second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }

permintaan.use((req, res, next) => {
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
        if(decoded.logged_in){
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

permintaan.get('/', (req, res) => {
    var fileName = 'permintaan.html'
    res.sendfile(fileName, options, (err) => {
        if(err){
            console.log(err)
        }  
    })
})

permintaan.post('/save', (req, res) => {
    
    console.log(req.body)
    /*var datetime = 'perm'+Date.now()
    var id_permintaan = 'per'+datetime
    var datetime_format = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;

    var data = req.body
    var nomor_surat = data.nomor_surat
    var tanggal = year+'-'+month+'-'+day
    var divisi = data.divisi
    var nama_peminta = data.nama_peminta
    var buat_pada = datetime_format
    var ubah_pada = datetime_format

    var detail_permintaan = data.detail_permintaan
    var panjang_data = detail_permintaan.length
    
    var values = [id_permintaan, nomor_surat, tannggal, divisi, nama_peminta, buat_pada, ubah_pada]
    
    try{
        dbconn.query('BEGIN', (err) => {
            if (shouldAbort(err)) {status_exec = false; return}
            dbconn.query('INSERT INTO permintaan (id_permintaan, nomor_surat, tanggal, divisi, nama_peminta, buat_pada, ubah_pada) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                values, (err) => {
                    if (shouldAbort(err)) return
                    var i = 0
                    for(i = 0; i < panjang_data; i++){
                        
                        var barang = detail_permintaan[i].barang
                        var huruf = detail_permintaan[i].huruf
                        var jumlah = detail_permintaan[i].jumlah
                        var kerterangan = detail_permintaan[i].keterangan
                        
                        values = [id_permintaan, barang, huruf, jumlah, keterangan]
                        dbconn.query('DELETE FROM detail_permintaan WHERE id_permintaan = ')
                        dbconn.query('INSERT INTO detail_permintaan (id_permintaan, barang, huruf, jumlah, keterangan) VALUES ($1, $2, $3, $4, $5)',
                            values, (err) => {
                                if (shouldAbort(err)) return
                                if (i == (panjang_data-1)){
                                    dbconn.query('COMMIT', (err) => {
                                        if(err){
                                            res.status(200).json({
                                                status : false
                                            })
                                        }else{
                                            res.status(200).json({
                                                satus : true
                                            })
                                        }
                                    })
                                }
                            }
                        )
                    }
                }
            )
        })
        dbconn.end()
    } catch(err) {
        res.status(400).json({
            status : false
        })
        dbconn.end()
    }*/
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
    
    var kolom = ['nomo_surat', 'tanggal', 'divisi', 'nama_peminta']
    if(order_kolom == '0'){
        order_kolom = 'id_permintaan'
        tipe_order = 'desc'
    }else{
        order_kolom = kolom[order_kolom]
    }

    var values = [isi_pencarian, isi_pencarian, isi_pencarian, isi_pencarian, order_kolom, tipe_order]
    var sql = "SELECT * FROM permintaan WHERE ( nomor_surat like '%"+isi_pencarian+"%' OR tanggal like '%"+isi_pencarian+"%' OR divisi like '%"+isi_pencarian+"%' OR nama_peminta like '%"+isi_pencarian+"%') ORDER BY "+order_kolom+" "+tipe_order
    
    try{
        await dbconn.query(sql, (err, resquery) => {
                if (err) {
                    var json_return = {
                        draw : 0,
                        recordsTotal : 0,
                        recordsFiltered : 0,
                        data : [],
                        message: err
                    }
                    res.status(200).json(json_return)
                }else{
                        var data = new Array()
                        var i = 0

                        resquery.rows.forEach((item) => {
                            var script_html = '<i class="left fa fa-pencil" style="cursor : pointer" onClick="ubah_modal(\''+item.id_permintaan+'\')"></i><span style="cursor : pointer" onClick="ubah_modal(\''+item.id_permintaan+'\')"> Edit</span> <i class="left fa fa-eye" style="cursor : pointer" onClick="detail_modal(\''+item.id_permintaan+'\')"></i><span style="cursor : pointer" onClick="detail_modal(\''+item.id_permintaan+'\')"> Detail</span>'
                            var data_table = [item.nomor_surat, item.tanggal, item.divisi, item.nama_peminta, item.status, script_html]
                            data[i] = data_table
                            i++
                        })

                        var json_return = {
                            draw : draw,
                            recordsTotal : resquery.rows.length,
                            recordsFiltered : resquery.rows.length,
                            data : data
                        }
                        res.status(200).json(json_return)
                }
            }
        )
    } catch (err){
        var json_return = {
            draw : 1,
            recordsTotal : 0,
            recordsFiltered : 0,
            data : [],
            message: err
        }
        res.status(200).json(json_return)
    }
    
})

permintaan.get('/find/:id', async (req, res) => {

    var id = req.params.id
    
    try{
        var sql = 'SELECT * FROM permintaan WHERE id_permintaan = \''+id+'\''
        await dbconn.query(sql, (err, resquery) => {
                if(err){
                    var json_return = {
                        draw : 0,
                        recordsTotal : 0,
                        recordsFiltered : 0,
                        data : [],
                        message: err
                    }
                    res.status(200).json(json_return)
                }else{
                    var json_return = {
                        status : true,
                        id_permintaan : resquery.rows[0].id_permintaan,
                        nomor_surat : resquery.rows[0].nomor_surat,
                        tanggal : resquery.rows[0].tanggal,
                        divisi : resquery.rows[0].divisi,
                        nama_peminta : resquery.rows[0].nama_peminta,
                        status_permintaan : resquery.rows[0].status,
                        detail : []
                    }
                    sql = 'SELECT * FROM detail_permintaan WHERE id_permintaan = \''+id+'\''
                    dbconn.query(sql, (err, resquery2) => {
                            if(err){
                                res.status(200).json({
                                    status : false
                                })
                            }else{
                                json_return.detail = resquery2.rows
                                res.status(200).json(json_return)
                            }
                        }
                    )
                }
            }
        )
    }catch (err) {
        var json_return = {satus : false}
        res.status(400).json(json_return)
    }
})

permintaan.post('/update/:id', async (err, res) => {

    console.log(req)
    /*
    var datetime = 'perm'+Date.now()
    var id_permintaan = req.params.id
    var datetime_format = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;

    var data = req.body
    var nomor_surat = data.nomor_surat
    var tanggal = data.tanggal
    var divisi = data.divisi
    var nama_peminta = data.nama_peminta
    var ubah_pada = datetime_format

    var detail_permintaan = data.detail_permintaan
    var panjang_data = detail_permintaan.length
    
    var values = [nomor_surat, tannggal, divisi, nama_peminta, buat_pada, ubah_pada, id_per]
    try{
        var sql = 'UPDATE permintaan SET nomor_surat = \''+nomor_surat+'\', tanggal = \''+tanggal+'\', nama_peminta = \''+nama_peminta+'\', status = \''+status+'\', ubah_pada = \''+ubah_pada+'\' WHERE id_permintaan = \''+id_permintaan+'\' ';
        await dbconn.query(sql, (err) => {
            if(err){
                res.status(200).json({
                    status : false
                })
            }else{
                dbconn.query('DELETE FROM detail_permintaan WHERE id_permintaan = \''+id_permintaan+'\'', (err) => {
                    if(err){
                        res.status(200).json({
                            status : false
                        })  
                    }else{
                        var i;
                        for(i = 0; i < panjang_data; i++){
                            var barang = detail_permintaan[i]['barang']
                            var huruf = detail_permintaan[i]['huruf']
                            var jumlah = detail_permintaan[i]['jumlah']
                            var keterangan = detail_permintaan[i]['keterangan']

                            sql = 'INSERT INTO detail_permintaan VALUES (\''+id_permintaan+'\', \''+barang+'\', \''+huruf+'\', \''+jumlah+'\', \''+keterangan+'\' ')
                            dbconn.query(sql, (err) => {
                                if(err){
                                    res.status(200).json({
                                        status : false
                                    })  
                                }else{
                                    res.status(200).json({
                                        status : true
                                    })  
                                }
                            })
                        }
                    }
                })
                
            }
        })
    } catch(err) {
        res.status(400).json({
            status : false
        })
    }*/
})

module.exports = permintaan;
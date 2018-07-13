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
    
    var datetime = 'perm'+Date.now()
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
    
    try{
        dbconn.connect()
        dbconn.query('BEGIN', (err) => {
            if (shouldAbort(err)) {status_exec = false; return}
            var values = [id_permintaan, nomor_surat, tannggal, divisi, nama_peminta, buat_pada, ubah_pada]
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
                        dbconn.query('INSERT INTO detail_permintaan (id_permintaan, barang, huruf, jumlah, keterangan) VALUES ($1, $2, $3, $4, $5)',
                            values, (err, res) => {
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
    } 
})

permintaan.get('/find/:id', (req, res) => {
    database.connection.getConnection((err, connection) => {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            var id = req.params.id
            connection.query('select * from permintaan where id_permintaan = ? ', id, (err, rows, fields) => {
                if (!err) {
                    appData.error = 0;
                    appData["data"] = rows;
                    res.status(201).json(appData);
                } else {
                    appData["data"] = "Error Occured!";
                    res.status(400).json(appData);
                }
            });
                connection.release();
            }
        });
})

module.exports = permintaan;
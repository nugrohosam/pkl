var express = require('express')
var instalasi = express.Router()
var cors = require('cors')
var dbconn = require('../database/database')
var jwt = require('jsonwebtoken')
var token;

var token = jwt.sign({ data: {logged_in : false}}, 'secret_token', { expiresIn: '1d' })
instalasi.use(cors())
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

instalasi.use((req, res, next) => {
    if(!req.cookies.token){
        var fileName = 'login.html'
            res.sendFile(fileName, options, (err) => {
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
            res.sendFile(fileName, options, (err) => {
                if(err){
                    console.log(err)
                }  
            })
        }
        if(decoded.logged_in && decoded.kategori == 'admin'){
            next()
        }
        else if(decoded.logged_in){
            var fileName = 'forbidden400.html'
            res.sendFile(fileName, options, (err) => {
                if(err){
                    console.log(err)
                }  
            })
        }
        else{
            var fileName = 'login.html'
            res.sendFile(fileName, options, (err) => {
                if(err){
                    console.log(err)
                }  
            })
        }
    }
})

instalasi.get('/', (req, res) => {
    var fileName = 'instalasi.html'
    res.sendFile(fileName, options, (err) => {
        if(err){
            console.log(err)
        }  
    })
})

instalasi.post('/save', async (req, res) => {
    
    var datetime = Date.now()
    var id_instalasi = 'inst'+datetime
    var datetime_format = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;

    var data = req.body
    var nama_instalasi = data.nama_instalasi
    var id_bidang = data.id_bidang
    var buat_pada = datetime_format
    var ubah_pada = datetime_format

    var sql

    try{
        await dbconn.query('BEGIN')

        sql = 'INSERT INTO instalasi (id_instalasi, id_bidang, nama_instalasi, buat_pada, ubah_pada ) VALUES (\''+id_instalasi+'\', \''+id_bidang+'\', \''+nama_instalasi+'\', \''+buat_pada+'\', \''+ubah_pada+'\')';
        await dbconn.query(sql)
        
        await dbconn.query('COMMIT')
        var json_return = {status : true}
        res.status(200).json(json_return)
    } catch(err) {
        await dbconn.query('ROLLBACK')
        var json_return = {satus : false}
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

instalasi.get('/find', async (req, res) => {

    var panjang_baris = req.query.length
    var awal_baris = req.query.start
    var pencarian = req.query.search
    var isi_pencarian = pencarian['value']
    var order = req.query.order
    var order_kolom = order['0'].column;
    var tipe_order = order['0'].dir
    var draw = req.query.draw
    
    var kolom = ['i.nama_instalasi', 'b.nama_bidang']

    if(order_kolom == '0'){
        order_kolom = 'i.id_instalasi'
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
        
        sql = "SELECT i.id_instalasi, i.nama_instalasi, b.nama_bidang FROM instalasi i INNER JOIN bidang b ON i.id_bidang = b.id_bidang  WHERE ( i.nama_instalasi LIKE '%"+isi_pencarian+"%' OR b.nama_bidang LIKE '%"+isi_pencarian+"%' ) ORDER BY "+order_kolom+" "+tipe_order+" LIMIT "+panjang_baris+" OFFSET "+awal_baris
        var { rows } = await dbconn.query(sql)
        var i = 0
        rows.forEach((item) => {
            var script_html = '<i class="left fa fa-pencil" style="cursor : pointer" onClick="ubah_modal(\''+item.id_instalasi+'\')"></i><span style="cursor : pointer" onClick="ubah_modal(\''+item.id_instalasi+'\')"> Edit</span> <i class="left fa fa-eye" style="cursor : pointer" onClick="detail_modal(\''+item.id_instalasi+'\')"></i><span style="cursor : pointer" onClick="detail_modal(\''+item.id_instalasi+'\')"> Detail</span>'
            
            if(item.status == 'selesai') {
                script_html = '<i class="left fa fa-eye" style="cursor : pointer" onClick="detail_modal(\''+item.id_instalasi+'\')"></i><span style="cursor : pointer" onClick="detail_modal(\''+item.id_instalasi+'\')"> Detail</span>'
            }
            var data_table = [item.nama_instalasi, item.nama_bidang, script_html]
            data[i] = data_table
            i++
        })

        sql = "SELECT * FROM instalasi i"
        rows = await dbconn.query(sql)
        recordsTotal = rows.rowCount
        
        sql = "SELECT * FROM instalasi i INNER JOIN bidang b ON i.id_bidang = b.id_bidang WHERE ( i.nama_instalasi LIKE '%"+isi_pencarian+"%' OR b.nama_bidang LIKE '%"+isi_pencarian+"%' ) ORDER BY "+order_kolom
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

instalasi.get('/find/:id', async (req, res) => {

    var id = req.params.id
    var sql

    try{
        await dbconn.query('BEGIN')

        sql = 'SELECT i.id_instalasi, i.nama_instalasi, b.id_bidang FROM instalasi i INNER JOIN bidang b ON i.id_bidang = b.id_bidang WHERE i.id_instalasi = \''+id+'\''
        var { rows } = await dbconn.query(sql)
        var json_return = {
            status : true,
            id_instalasi : rows[0].id_instalasi,
            nama_instalasi : rows[0].nama_instalasi,
            nama_bidang : rows[0].nama_bidang,
            id_bidang : rows[0].id_bidang
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

instalasi.post('/update/:id', async (req, res) => {

    var id_instalasi = req.params.id
    var datetime_format = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;

    var data = req.body
    var nama_instalasi = data.nama_instalasi
    var id_bidang = data.id_bidang
    var ubah_pada = datetime_format

    var sql

    try{
        await dbconn.query('BEGIN')

        sql = 'UPDATE instalasi SET nama_instalasi = \''+nama_instalasi+'\', id_bidang =  \''+id_bidang+'\', ubah_pada = \''+ubah_pada+'\' WHERE id_instalasi = \''+id_instalasi+'\' ';
        await dbconn.query(sql)

        await dbconn.query('COMMIT')
        var json_return = {status : true}
        res.status(200).json(json_return)
    } catch(err) {
        await dbconn.query('ROLLBACK')
        var json_return = {status : false}
        res.status(400).json(json_return)
    } finally {
        await dbconn.release
    }
})

instalasi.get('/find_bidang', async (req, res) => {
    
    try{
        await dbconn.query('BEGIN')

        var { rows } = await dbconn.query(' SELECT id_bidang, nama_bidang FROM bidang')
        var json_return = {
            status : false, 
            bidang : rows
        }

        await dbconn.query('COMMIT')
        res.status(200).json(json_return)
    } catch(err){
        await dbconn.query('ROLLBACK')
        var json_return = { status : false}
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})
module.exports = instalasi;
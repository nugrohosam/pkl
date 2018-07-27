var express = require('express')
var pengguna = express.Router()
var cors = require('cors')
var dbconn = require('../database/database')
var jwt = require('jsonwebtoken')
var md5 = require('md5')
var token;

var token = jwt.sign({ data: {logged_in : false}}, 'secret_token', { expiresIn: '1d' })
pengguna.use(cors())
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

pengguna.use((req, res, next) => {
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
        if(decoded.logged_in && decoded.kategori == 'admin'){
            next()
        }
        else if(decoded.logged_in){
            var fileName = 'forbidden400.html'
            res.sendfile(fileName, options, (err) => {
                if(err){
                    console.log(err)
                }  
            })
        }
        else{
            var fileName = 'login.html'
            res.sendfile(fileName, options, (err) => {
                if(err){
                    console.log(err)
                }  
            })
        }
    }
})

pengguna.get('/', (req, res) => {
    var fileName = 'pengguna.html'
    res.sendfile(fileName, options, (err) => {
        if(err){
            console.log(err)
        }  
    })
})

pengguna.post('/save', async (req, res) => {
    
    var datetime = Date.now()
    var id_pengguna = 'peng'+datetime
    var datetime_format = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;

    var data = req.body
    var username = data.username
    var kategori = data.kategori
    var password = md5(data.password)

    var buat_pada = datetime_format
    var ubah_pada = datetime_format

    var sql

    try{
        await dbconn.query('BEGIN')

        sql = 'INSERT INTO pengguna (id_pengguna, kategori, username, password, buat_pada, ubah_pada ) VALUES (\''+id_pengguna+'\', \''+kategori+'\', \''+username+'\', \''+password+'\', \''+buat_pada+'\', \''+ubah_pada+'\' )';
        var result = await dbconn.query(sql)
        
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

pengguna.get('/find', async (req, res) => {

    var panjang_baris = req.query.length
    var awal_baris = req.query.start
    var pencarian = req.query.search
    var isi_pencarian = pencarian['value']
    var order = req.query.order
    var order_kolom = order['0'].column;
    var tipe_order = order['0'].dir
    var draw = req.query.draw
    
    var kolom = ['p.kategori', 'p.username' ]

    if(order_kolom == '0'){
        order_kolom = 'id_pengguna'
        tipe_order = 'desc'
    }else{
        order_kolom = kolom[order_kolom]
    }

    var sql = '';
    var data = new Array()
    var recordsFiltered = 0
    var recordsTotal = 0
    var data = new Array()

    try{
        await dbconn.query('BEGIN')
        
        sql = "SELECT p.id_pengguna, p.kategori, p.username, p.password FROM pengguna p WHERE ( p.username LIKE '%"+isi_pencarian+"%' OR p.kategori LIKE '%"+isi_pencarian+"%' ) ORDER BY "+order_kolom+" "+tipe_order+" LIMIT "+panjang_baris+" OFFSET "+awal_baris
        var { rows } = await dbconn.query(sql)
        var i = 0
        rows.forEach((item) => {
            var script_html = '<i class="left fa fa-pencil" style="cursor : pointer" onClick="ubah_modal(\''+item.id_pengguna+'\')"></i><span style="cursor : pointer" onClick="ubah_modal(\''+item.id_pengguna+'\')"> Edit</span> <i class="left fa fa-eye" style="cursor : pointer" onClick="detail_modal(\''+item.id_pengguna+'\')"></i><span style="cursor : pointer" onClick="detail_modal(\''+item.id_pengguna+'\')"> Detail</span>'
            
            if(item.status == 'selesai') {
                script_html = '<i class="left fa fa-eye" style="cursor : pointer" onClick="detail_modal(\''+item.id_pengguna+'\')"></i><span style="cursor : pointer" onClick="detail_modal(\''+item.id_pengguna+'\')"> Detail</span>'
            }
            var data_table = [item.username, item.kategori, script_html]
            data[i] = data_table
            i++
        })

        sql = "SELECT * FROM pengguna p "
        rows = await dbconn.query(sql)
        recordsTotal = rows.rowCount
        
        sql = "p.id_pengguna, p.kategori, p.username, p.password FROM pengguna p WHERE ( p.username LIKE '%"+isi_pencarian+"%' OR p.kategori LIKE '%"+isi_pencarian+"%' OR i.nama_instalasi LIKE '%"+isi_pencarian+"%' OR p.nama_peminta LIKE '%"+isi_pencarian+"%' ) ORDER BY "+order_kolom+" "+tipe_order
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

pengguna.get('/find/:id', async (req, res) => {

    var id = req.params.id
    var sql

    try{
        await dbconn.query('BEGIN')

        sql = 'SELECT p.id_pengguna, p,kategori, p.username, p.password FROM pengguna p WHERE p.id_pengguna = \''+id+'\''
        var { rows } = await dbconn.query(sql)
        var json_return = {
            status : true,
            id_pengguna : rows[0].id_pengguna,
            kategori : rows[0].kategori,
            username : rows[0].username
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

pengguna.post('/update/:id', async (req, res) => {

    var id_pengguna = req.params.id
    var datetime_format = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;

    var data = req.body
    var kategori = data.kategori
    var username = data.username
    var password = md5(data.password)
    var ubah_pada = datetime_format
    
    var sql

    try{
        await dbconn.query('BEGIN')
        
        if(data.password == ''){
            sql = 'UPDATE pengguna SET kategori = \''+kategori+'\', username =  \''+username+'\', ubah_pada = \''+ubah_pada+'\' WHERE id_pengguna = \''+id_pengguna+'\''
        }else{
            sql = 'UPDATE pengguna SET kategori = \''+kategori+'\', username =  \''+username+'\', password = \''+password+'\', ubah_pada = \''+ubah_pada+'\' WHERE id_pengguna = \''+id_pengguna+'\''
        }
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

module.exports = pengguna;
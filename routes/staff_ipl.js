const express = require('express')
const staff_ipl = express.Router()
const cors = require('cors')
const dbconn = require('../database/database')
const jwt = require('jsonwebtoken')
const md5 = require('md5')

var token = jwt.sign({ data: {logged_in : false}}, 'secret_token', { expiresIn: '1d' })
staff_ipl.use(cors())
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

staff_ipl.use((req, res, next) => {
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

staff_ipl.get('/', (req, res) => {
    var fileName = 'staff_ipl.html'
    res.sendFile(fileName, options, (err) => {
        if(err){
            console.log(err)
        }  
    })
})

staff_ipl.post('/save', async (req, res) => {
    
    var datetime = Date.now()
    var id_staff_ipl = 'staf'+datetime
    var datetime_format = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;

    var data = req.body
    var nama = data.nama
    var nip = data.nip

    var buat_pada = datetime_format
    var ubah_pada = datetime_format

    var sql

    try{
        await dbconn.query('BEGIN')

        sql = 'INSERT INTO staff_ipl (id_staff_ipl, nama, nip, buat_pada, ubah_pada ) VALUES (\''+id_staff_ipl+'\', \''+nama+'\', \''+nip+'\', \''+buat_pada+'\', \''+ubah_pada+'\' )';
        await dbconn.query(sql);

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

staff_ipl.get('/find', async (req, res) => {

    var panjang_baris = req.query.length
    var awal_baris = req.query.start
    var pencarian = req.query.search
    var isi_pencarian = pencarian['value']
    var order = req.query.order
    var order_kolom = order['0'].column;
    var tipe_order = order['0'].dir
    var draw = req.query.draw
    
    var kolom = ['s.nama', 's.nip']

    if(order_kolom == ''){
        order_kolom = 's.id_staff_ipl'
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
        
        sql = "SELECT s.id_staff_ipl, s.nama, s.nip FROM staff_ipl s WHERE ( s.nama LIKE '%"+isi_pencarian+"%' OR s.nip LIKE '%"+isi_pencarian+"%' ) ORDER BY "+order_kolom+" "+tipe_order+" LIMIT "+panjang_baris+" OFFSET "+awal_baris
        var { rows } = await dbconn.query(sql)
        var i = 0
        rows.forEach((item) => {
            var script_html = '<i class="left fa fa-pencil" style="cursor : pointer" onClick="ubah_modal(\''+item.id_staff_ipl+'\')"></i><span style="cursor : pointer" onClick="ubah_modal(\''+item.id_staff_ipl+'\')"> Edit</span> <i class="left fa fa-eye" style="cursor : pointer" onClick="detail_modal(\''+item.id_staff_ipl+'\')"></i><span style="cursor : pointer" onClick="detail_modal(\''+item.id_staff_ipl+'\')"> Detail</span>'
            var data_table = [item.nama, item.nip, script_html]
            data[i] = data_table
            i++
        })

        sql = "SELECT * FROM staff_ipl s "
        rows = await dbconn.query(sql)
        recordsTotal = rows.rowCount
        
        sql = "s.id_staff_ipl, s.nama, s.nip, FROM staff_ipl s WHERE ( s.nama LIKE '%"+isi_pencarian+"%' OR s.nip LIKE '%"+isi_pencarian+"%') ORDER BY "+order_kolom+" "+tipe_order
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

staff_ipl.get('/find/:id', async (req, res) => {

    var id = req.params.id
    var sql

    try{
        await dbconn.query('BEGIN')

        sql = 'SELECT s.id_staff_ipl, s,nama, s.nip FROM staff_ipl s WHERE s.id_staff_ipl = \''+id+'\''
        var { rows } = await dbconn.query(sql)
        var json_return = {
            status : true,
            id_staff_ipl : rows[0].id_staff_ipl,
            nama : rows[0].nama,
            nip : rows[0].nip
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

staff_ipl.post('/update/:id', async (req, res) => {

    var id_staff_ipl = req.params.id
    var datetime_format = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;

    var data = req.body
    var nama = data.nama
    var nip = data.nip
    var ubah_pada = datetime_format
    
    var sql

    try{
        await dbconn.query('BEGIN')
        
        sql = 'UPDATE staff_ipl SET nama = \''+nama+'\', nip =  \''+nip+'\', ubah_pada = \''+ubah_pada+'\' WHERE id_staff_ipl = \''+id_staff_ipl+'\''
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

module.exports = staff_ipl;
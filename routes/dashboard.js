var express = require('express')
var dashboard = express.Router()
var cors = require('cors')
var dbconn = require('../database/database')
var jwt = require('jsonwebtoken')
var token;

var token = jwt.sign({ data: {logged_in : false}}, 'secret_token', { expiresIn: '1d' })
dashboard.use(cors())
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

dashboard.use((req, res, next) => {
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

dashboard.get('/', (req, res) => {
    var fileName = 'dashboard.html'
            res.sendfile(fileName, options, (err) => {
                if(err){
                    console.log(err)
                }  
            })
})

dashboard.get('/data', async (req, res) => {
    
    var sql
    var tahun_ini
    var bulan_ini
    var hari_ini
    try{
        await dbconn.query('BEGIN')
        sql = 'SELECT * FROM permintaan WHERE tanggal LIKE \'%'+year+'%\'';
        var { rows } = await dbconn.query(sql)
        tahun_ini = rows.length

        sql = 'SELECT * FROM permintaan WHERE tanggal LIKE \'%'+year+'-'+month+'%\'';
        var { rows } = await dbconn.query(sql)
        bulan_ini = rows.length

        sql = 'SELECT * FROM permintaan WHERE tanggal LIKE \'%'+year+'-'+month+'-'+day+'\'';
        var { rows } = await dbconn.query(sql)
        hari_ini = rows.length
        
        await dbconn.query('COMMIT')
        
        var json_return = {
            status : true,
            tahun_ini : tahun_ini,
            bulan_ini : bulan_ini,
            hari_ini : hari_ini
        }
        res.status(200).json(json_return)
    } catch(err) {
        await dbconn.query('ROLLBACK')
        var json_return = {status : false}
        res.status(200).json(json_return)
    } finally {
        await dbconn.release
    }
})

module.exports = dashboard;
var express = require('express')
var authentication = express.Router()
var cors = require('cors')
var dbconn = require('../database/database')
var jwt = require('jsonwebtoken')
var md5 = require('md5')

var token = jwt.sign({logged_in  : false}, 'secret_token')
var appData = {}
var options = {
    root: './src/views/'
}

authentication.use(cors())

authentication.use((req, res, next) => {
    if(!req.cookies.token && req.method != 'POST' && req.method != 'GET'){
        var fileName = 'login.html'
            res.sendFile(fileName, options, (err) => {
                if(err){
                    console.log(err)
                }  
        })
    }else if(req.url != '/proccess' && req.url != '/auth_nav'){
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

        if(decoded.logged_in){
            var fileName = 'dashboard.html'
            res.sendFile(fileName, options, (err) => {
                if(err){
                    console.log(err)
                }  
            })
        }else{
            var fileName = 'login.html'
            res.sendFile(fileName, options, (err) => {
                if(err){
                    console.log(err)
                }  
            })
        }
    }else{
        next()
    }
})

authentication.post('/proccess', async (req, res) => {
    
    var username = req.body.username
    var password = md5(req.body.password)
    
        try{
            await dbconn.query('BEGIN')
            var { rows } = await dbconn.query('SELECT * FROM pengguna WHERE username = \''+username+'\' AND password = \''+password+'\'')
            if(rows.length == 1){
                var token_code = jwt.sign({logged_in  : true, kategori : rows[0].kategori}, 'secret_token', { expiresIn : '1d'})  
                if(token_code != ''){
                    var json_return = {status : true, token : token_code}
                    res.status(200).json(json_return)  
                }else{
                    var json_return = {status : false}
                    res.status(200).json(json_return)
                }    
            }else{
                var json_return = {status : false}
                res.status(200).json(json_return)
            }

            await dbconn.query('COMMIT')
        } catch(err){
            await dbconn.query('ROLLBACK')
            var json_return = {status : false}
            res.status(200).json(json_return)
        } finally {
            await dbconn.release
        }
})

authentication.get('/auth_nav', async (req, res) => {
    var token = req.cookies.token
    var decoded
    try {
        decoded = await jwt.verify(token, 'secret_token')
        var kategori = decoded.kategori

        var json_return = {
            'status' : true,
            'role' : kategori
        }
        res.status(200).json(json_return)
    } catch (err){
        var json_return = {
            'status' : false
        }
        res.status(200).json(json_return)
    }
});

module.exports = authentication;
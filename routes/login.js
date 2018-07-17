var express = require('express')
var login = express.Router()
var cors = require('cors')
var jwt = require('jsonwebtoken')

var token = jwt.sign({logged_in  : false}, 'secret_token')
var appData = {}
var options = {
    root: './src/views/'
}

login.use(cors())

login.use((req, res, next) => {
    if(!req.cookies.token && req.method != 'POST'){
        var fileName = 'login.html'
            res.sendfile(fileName, options, (err) => {
                if(err){
                    console.log(err)
                }  
        })
    }else if(req.url != '/proccess'){
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
            var fileName = 'permintaan.html'
            res.sendfile(fileName, options, (err) => {
                if(err){
                    console.log(err)
                }  
            })
        }else{
            var fileName = 'login.html'
            res.sendfile(fileName, options, (err) => {
                if(err){
                    console.log(err)
                }  
            })
        }
    }else{
        next()
    }
})

login.post('/proccess', (req, res) => {
    
    var email = req.body.username
    var password = req.body.password
    
    if(email == 'admin' && password == 'admin'){
        var token_code = jwt.sign({logged_in  : true}, 'secret_token', { expiresIn : '1d'})
        res.status(200).json({ status : true, token : token_code })
    } else {
        res.status(200).json({ status : false })
    }
})

module.exports = login;
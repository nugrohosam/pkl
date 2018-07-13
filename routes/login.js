var express = require('express')
var permintaan = express.Router()
var cors = require('cors')
var jwt = require('jsonwebtoken')

var token = jwt.sign({logged_in  : false}, 'secret_token')
var appData = {}
var options = {
    root: './src/views/'
}

permintaan.use(cors())

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
    }

    var decoded = jwt.verify(token, 'secret_token')
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


})

permintaan.get('/', (req, res, next) => {
    var fileName = 'login.html'
    res.sendfile(fileName, options, (err) => {
        if(err){
            console.log(err)
        }
    })
})

permintaan.post('/proccess', (req, res) => {
    
    var email = req.body.username
    var password = req.body.password
    
    if(email == 'admin' && password == 'admin'){
        var token_code = jwt.sign({ data: {logged_in : true}}, 'secret_token', { expiresIn: '1d' })   
        res.status(200).json({ status : true, token : token_code })
    } else {
        res.status(200).json({ status : false })
    }
})

module.exports = permintaan;
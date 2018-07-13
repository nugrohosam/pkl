var express = require('express');
var permintaan = express.Router();
var database = require('../Database/database');
var cors = require('cors')
var jwt = require('jsonwebtoken');
var token;

permintaan.use(cors())
process.env.SECRET_KEY = "user_key"

permintaan.get('/', (req, res) => {
    var options = {
        root: './src/views/'
    }

    var fileName = 'permintaan.html'
    res.sendfile(fileName, options, (err) => {
        if(err){
            console.log(err)
        }
    })
})

module.exports = permintaan;
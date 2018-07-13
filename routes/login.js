var express = require('express')
var permintaan = express.Router()
var cors = require('cors')
var bodyParser = require('body-parser')
var database = require('../database/database')
var jwt = require('jsonwebtoken')
var token;

permintaan.use(cors())
process.env.SECRET_KEY = "user_key"
var appData = {}

permintaan.get('/', (req, res) => {
    var options = {
        root: './src/views/'
    }

    var fileName = 'login.html'
    res.sendfile(fileName, options, (err) => {
        if(err){
            console.log(err)
        }
    })
})

permintaan.post('/proccess', (req, res) => {
    
    //var email = req.body.email
    //var password = req.body.password

    console.log(req.body)
    /*database.connection.getConnection((err, connection) => {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('select * from users where email = ? and password = ? ', email, password, (err, rows, fields) => {
                if (!err) {
                    appData.error = 0;
                    appData["data"] = rows;
                    console.log(re)
                } else {
                    appData["data"] = "Error Occured!";
                    res.status(400).json(appData);
                }
            });
                connection.release();
            }
        });*/
})

module.exports = permintaan;
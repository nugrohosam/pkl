var express = require('express');
var permintaan = express.Router();
var database = require('../database/database');
var cors = require('cors')
var jwt = require('jsonwebtoken');
var token;

permintaan.use(cors())
process.env.SECRET_KEY = "user_key"
var appData = {}

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
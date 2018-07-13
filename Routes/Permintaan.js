var express = require('express')
var permintaan = express.Router()
var cors = require('cors')
var database = require('../database/database')
var jwt = require('jsonwebtoken')
var token;

var token = jwt.sign({ data: {logged_in : false}}, 'secret_token', { expiresIn: '1d' })
permintaan.use(cors())
var appData = {}
var options = {
    root: './src/views/'
}


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

permintaan.get('/', (req, res) => {
    var fileName = 'permintaan.html'
    res.sendfile(fileName, options, (err) => {
        if(err){
            console.log(err)
        }  
    })
})

permintaan.post('/save', (req, res) => {
    
    var datetime = Date.now()
    var id_permintaan = 'per'+datetime

    console.log(req.body)
    
    database.connection.getConnection((err, connection) => {
        if(err){
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        }else{
            connection.query('insert into permintaan values ( ?, ?, ?, ?, ? )', id_permintaan, nama, datetime, datetime, null, (err) => {
                if (!err) {
                    appData.error = 0;
                    appData["data"] = "User registered successfully!";
                    res.status(201).json(appData);
                } else {
                    appData["data"] = "Error Occured!";
                    res.status(400).json(appData);
                }
            });
            connection.release();
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
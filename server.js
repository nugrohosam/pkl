var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var users = require('./routes/users')
var permintaan = require('./routes/permintaan')
var login = require('./routes/login')

app.use(express.static('src/assets/'))
app.use('/users',users)
app.use('/login',login)
app.use('/permintaan',permintaan)

app.listen(port,function(){
    console.log('Server is running on port: '+port);
});
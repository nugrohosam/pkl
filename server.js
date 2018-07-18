var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var session = require('express-session')
var cookieParser = require('cookie-parser')
var port = process.env.PORT || 3000

app.use(cookieParser())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }))

var perintah_kerja = require('./routes/perintah_kerja')
var permintaan = require('./routes/permintaan')
var login = require('./routes/login')

app.use('/perintah_kerja',perintah_kerja)
app.use('/login',login)
app.use('/permintaan',permintaan)
app.use(express.static('src/assets/'))

app.listen(port,function(){
    console.log('Server is running on port: '+port);
});
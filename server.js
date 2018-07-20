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
var dashboard = require('./routes/dashboard')
var permintaan = require('./routes/permintaan')
var login = require('./routes/login')
var instalasi = require('./routes/instalasi')

app.use('/dashboard',dashboard)
app.use('/instalasi',instalasi)
app.use('/perintah_kerja',perintah_kerja)
app.use('/permintaan',permintaan)
app.use('/login',login)
app.use(express.static('src/assets/'))

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    var options = {
        root: './src/views/'
    }
    res.sendFile('error404.html', options)
});

app.listen(port,function(){
    console.log('Server is running on port: '+port);
});
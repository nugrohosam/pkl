var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var server = require('http').Server(app);
var io = require('socket.io')(server)
var port = process.env.PORT || 3000

app.use(cookieParser())

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())

var perintah_kerja = require('./routes/perintah_kerja')
var dashboard = require('./routes/dashboard')
var laporan = require('./routes/laporan')
var permintaan = require('./routes/permintaan')
var authentication = require('./routes/authentication')
var instalasi = require('./routes/instalasi')
var bidang = require('./routes/bidang')
var staff_ipl = require('./routes/staff_ipl')
var pengguna = require('./routes/pengguna')

app.use('/src/assets', express.static('./src/assets/'))
app.use('/dashboard', dashboard)
app.use('/laporan', laporan)
app.use('/instalasi', instalasi)
app.use('/bidang', bidang)
app.use('/pengguna', pengguna)
app.use('/staff_ipl', staff_ipl)
app.use('/perintah_kerja', perintah_kerja)
app.use('/permintaan', permintaan)
app.use('/authentication', authentication)

// redirect
app.use('/', dashboard)

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    var options = {
        root: './src/views/'
    }
    res.sendFile('error404.html', options)
});

server.listen(port, function () {
    console.log('Server is running on port: ' + port);
});

io.on('connection', function (socket) {
    socket.on('reloadPerngguna', function (data) {
        if (data.status) {
            socket.broadcast.emit('reloadPerngguna', {
                status: true
            })
        }
    })
    socket.on('reloadInstalasi', function (data) {
        if (data.status) {
            socket.broadcast.emit('reloadInstalasi', {
                status: true
            })
        }
    })
    socket.on('reloadPermintaan', function(data){
        if(data.status){
            socket.broadcast.emit('reloadPermintaan', {
                status: true
            })
        }
    })
    socket.on('reloadStaffIpl', function(data){
        if(data.status){
            socket.broadcast.emit('reloadStaffIpl', {
                status: true
            })
        }
    })
    socket.on('reloadPerintahKerja', function(data){
        if(data.status){
            socket.broadcast.emit('reloadPerintahKerja', {
                status: true
            })
        }
    })
    socket.on('reloadBidang', function(data){
        if(data.status){
            socket.broadcast.emit('reloadBidang', {
                status: true
            })
        }
    })
});
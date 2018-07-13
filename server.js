var express = require('express')
var app = express()
var port = process.env.PORT || 3000

var users = require('./routes/users')
var permintaan = require('./routes/permintaan')

app.use(express.static('src/assets/'))
app.use('/users',users)
app.use('/permintaan',permintaan)

app.listen(port,function(){
    console.log('Server is running on port: '+port);
});
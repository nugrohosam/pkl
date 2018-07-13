var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));

var Users = require('./Routes/Users')
var Permintaan = require('./Routes/Permintaan')

app.use(express.static('src/assets/'))
app.use('/users',Users)
app.use('/permintaan',Permintaan)

app.listen(port,function(){
    console.log('Server is running on port: '+port);
});
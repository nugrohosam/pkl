var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
var app = express()
var session = require('express-session')

app.use(bodyParser.json());

app.use(session({
  secret: 'session_id',
  resave: false,
  saveUninitialized: true
}))

app.use((req, res, next) => {
  if(!session.login){
    session.login = false
  }
  next()
})

router.get('/', (req, res, next) => {

  var options = {
    root: __dirname + '/src/views/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  }
  
  var fileName = 'login'
  res.sendFile(fileName+'.html', options, (err) => {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  })
})
.post('/', (req, res) => {
  console.log(req.body)
  res.json(req.body);
  /*var username = req.body.data.username
  var password = req.body.data.password
  if(username == 'admin' && password == 'admin'){
    req.session.login = true
    res.status(200).json({ status : true, message : 'login' });
  }else{
    res.status(403).json({ status : false, message : 'email & password do not match'})
  }*/
})
  
  router.get('/:page', (req, res, next) => {
  
      var options = {
        root: __dirname + '/src/views/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
      }
      
      var fileName = req.params.page
      if(!session.login || fileName == 'login'){
        res.sendFile(fileName+'.html', options, (err) => {
          if (err) {
            next(err);
          } else {
            console.log('Sent:', fileName);
          }
        })
      }else if(session.login){
        if(fileName !== 'logout'){
          session.destroy( (err) => {
            console.log(err)
          })
          res.sendFile('login.html', options, (err) => {
            if (err) {
              next(err);
            } else {
              console.log('Sent:', fileName);
            }
          })
        }else{
          res.sendFile(fileName+'.html', options, (err) => {
            if (err) {
              next(err);
            } else {
              console.log('Sent:', fileName);
            }
          })
        }
      }else{
        res.sendFile('permintaan.html', options, (err) => {
          if (err) {
            next(err);
          } else {
            console.log('Sent:', fileName);
          }
        })
      }
  })

  router.use(express.static('src/assets'))

  module.exports = router
var express = require('express')
var router = express.Router()
var app = express()
const sesssion = require('express-session')

app.use(session({
  secret: 'session_id',
  resave: false,
  saveUninitialized: true
}))

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
    var username = req.body.username
    var password = req.body.password
    if(username == 'admin' && password == 'admin'){
      req.session.login = true
      res.status(200).json({ status : true, message : 'login' });
    }else{
      res.status(403).json({ status : false, message : 'email & password do not match'})
    }
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
      
      if(req.session.login){
        var fileName = req.params.page;
        if(fileName !== 'logout'){
          res.sendFile(fileName+'.html', options, (err) => {
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
        var fileName = 'login'
        res.sendFile(fileName+'.html', (req, ers) => {
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
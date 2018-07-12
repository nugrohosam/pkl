var express = require('express')
var router = express.Router()
const sesssion = require('express-session')

router.get('/', (req, res, next) => {

    var options = {
      root: __dirname + '/src/views/',
      dotfiles: 'deny',
      headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
      }
    }
    
    var fileName = 'login.html'
    res.sendFile(fileName, options, (err) => {
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
    
      var fileName = req.params.page;
      if(fileName !== 'logout'){
        res.sendFile(fileName+'.html', options, function (err) {
          if (err) {
            next(err);
          } else {
            console.log('Sent:', fileName);
          }
        })
      }else{
        res.sendFile(fileName+'.html', options, function (err) {
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
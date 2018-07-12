const express = require('express')
const app = express()

app.get('/', (req, res, next) => {

    var options = {
      root: __dirname + '/src/views/',
      dotfiles: 'deny',
      headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
      }
    }
  
    res.sendFile('login.html', options, function (err) {
      if (err) {
        next(err);
      } else {
        console.log('Sent:', fileName);
      }
    })
})

app.get('/:page', (req, res, next) => {

    var options = {
      root: __dirname + '/src/views/',
      dotfiles: 'deny',
      headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
      }
    }
  
    var fileName = req.params.page;
    res.sendFile(fileName+'.html', options, function (err) {
      if (err) {
        next(err);
      } else {
        console.log('Sent:', fileName);
      }
    })
})

app.use(express.static('src/assets'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))
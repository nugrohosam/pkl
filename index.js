const express = require('express')
const app = express()

app.get('/', (req, res) => res.sendFile('src/views/login.html'))
app.get('/:page', (req, res) => res.sendFile('src/views/'+req.page))

app.listen(3000, () => console.log('Example app listening on port 3000!'))
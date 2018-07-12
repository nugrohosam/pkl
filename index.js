const express = require('express')
const app = express()
const router = require('./router')

app.use(router)

app.listen(3000, () => console.log('Example app listening on port 3000!'))
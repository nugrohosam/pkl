var mysqlModel = require('mysql-model')

var MyAppModel = mysqlModel.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'administrator',
    database : 'ipl',
  })
   
  var Movie = MyAppModel.extend({
      tableName: "permintaan",
  })

  movie.find('all')


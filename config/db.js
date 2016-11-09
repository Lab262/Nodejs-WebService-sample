
function setupDatabase(){  var mongoose   = require('mongoose')
  var environment = require('./environment')  // get our config file
  var pg = require('pg');
  pg.connect(environment.database.host, function(err, client, done) {
    if (err) {
      console.log(err);
     
    }
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err);  
         
        }
      else
       {  
         console.log("PASSSOU CARAI");
         console.log(result);
       }
    });
  });

}

exports.setupDatabase = setupDatabase


// exports.db = db

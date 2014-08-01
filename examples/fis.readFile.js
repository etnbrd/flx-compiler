var app = require('express')(),
    fis = require('fs');

app.get('/', function reply(req, res){
  fis.readFile(__filename, function(error, data) {
    res.send(data);
  });
});

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}

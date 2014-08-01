var app = require('express')(),
    fs = require('fs');

app.get('/', function reply(req, res){
  fs.readFile(__filename, function(error, data) {
    res.send(data);
  });
});

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}

exports.app = app;

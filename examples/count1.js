var app = require('express')();

app.get('/', function reply(req, res){
  res.send('42');
});

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}

exports.app = app;

var app = require('express')();

var _rep = 42;

app.get('/A', function replyA(req, res){
  res.send('' + _rep);
  _rep += 1;
});

app.get('/B', function replyB(req, res){
  res.send('' + _rep);
  _rep += 2;
});

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}

exports.app = app;
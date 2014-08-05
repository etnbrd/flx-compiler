var ex = require('express')
var app = ex();

app.get('/', function reply(req, res){
  var _rep = '42';
  res.send(_rep);
});

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}
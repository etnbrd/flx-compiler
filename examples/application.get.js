var application = require('express')();

application.get('/', function reply(req, res){
  var _rep = '42';
  res.send(_rep);
});

if (!module.parent) {
    application.listen(8080);
    console.log('>> listening 8080');
}

exports.app = application;

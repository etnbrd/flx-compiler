var app = require('express')();
var fs = require('fs');

// module.exports =  function(req, res){
//                 res.send('42');
//               };

var reply = function(req, res){
                res.send('42');
              };

app.get('/', reply);

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}

fs.writeLog(function log() {
  return '{pho,fun}ny log';
});

exports.app = app;
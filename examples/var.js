var app = require('express')();

var reply = function(req, res){
  res.send('42');
};

app.get('/', reply);

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}
exports.app = app;

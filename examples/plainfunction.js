var app = require('express')();

function reply(req, res){
  res.send('42');
}

app.get('/', reply);

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}
exports.app = app;

var app = require('express')();
var cond = true;

if (cond)
    app.get("/", function reply(req, res){
      var _rep = 'B';
      res.send(_rep);
    });

if (!module.parent) {
    app.listen(8080);
    console.log(">> listening 8080");
}

exports.name = "ifthenout";
exports.app = app;
var app = require('express')();
var cond = false;

if (cond)
    app.get("/", function reply1(req, res){
      var _rep = 'C';
      res.send(_rep);
    });
else
    // FIX : Fail with the same name / src/pruner/constructors.js:52
    app.get("/", function reply2(req, res){
      var _rep = 'D';
      res.send(_rep);
    });

if (!module.parent) {
    app.listen(8080);
    console.log(">> listening 8080");
}

exports.name = "ifthenelseout";
exports.app = app;

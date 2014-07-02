var app = require('express')();

app.get("/", function reply(req, res){
  var _rep = "42";
  res.send(_rep);
});

if (!module.parent) {
    app.listen(8080);
    console.log(">> listening 8080");
}

exports.app = app;

var app = require('express')();

var _rep = "42";

app.get("/", function reply(req, res){
  res.send(_rep);
});

app.listen(8080);
console.log(">> listening 8080");
var app = require('express')();

app.get("/", function reply(req, res){
  res.send("42");
});

app.listen(8080);
console.log(">> listening 8080");

var app = require('express')();
// var truc = require('./truc.js');

// var count = {};

app.get("/:id", function reply(req, res){
  // console.log("      >> recv " + req.params.id);
  // count[req.params.id] = count[req.params.id] + 1  || 1; // Problem #4
  // var visits = count[req.params.id]; // Problem #3
  // var reply = req.params.id + '[' + visits + ']';
  // var reply = req.params.id + '[' + 42 + ']'; // Problem #2
  res.send(reply);
});

var port = 8080;
app.listen(port);
console.log(">> listening 8080");
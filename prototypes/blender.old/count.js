var app = require('express')();

// var count = {};
var count = 0;

app.get("/:id", function rep(req, res){
  // console.log("      >> recv " + req.params.id);
  // count[req.params.id] = count[req.params.id] + 1 || 1;
  // var visits = count[req.params.id];
  // var reply = req.params.id + '[' + visits + ']';
  res.send(count = count + 1);
});

app.listen(8080);
// console.log(">> listening 8080");
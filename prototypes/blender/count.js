var app = require('express')();

// var count = {};
var count = 0;

// function truc(machin, chose) {
// 	return machin + chose;
// }

app.get("/:id", function rep(req, res){
  // console.log("      >> recv " + req.params.id);
  // count[req.params.id] = count[req.params.id] + 1 || 1;
  // var visits = count[req.params.id];
  // var reply = req.params.id + '[' + visits + ']';
  res.send(count = count + 1);
  // count = count + 1;
  // res.send(truc("1", count));
});

app.listen(8080);
// console.log(">> listening 8080");
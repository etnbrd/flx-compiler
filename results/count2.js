var flx = require("flx");
var app = require('express')();

app.get("/", function placeholder() {
  return flx.start(flx.m("reply", {
    _args: arguments,
    _sign: {}
  }));
});

app.listen(8080);
console.log(">> listening 8080");

// reply >> ø

flx.register("reply", function capsule(msg) {
    (function reply(req, res) {
      var _rep = "42";
      res.send(_rep);
    }).apply(this, msg._args);
});
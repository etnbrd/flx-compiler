var flx = require("flx");
var app = require('express')();
var _rep = "42";

app.get("/", function placeholder() {
  return flx.start(flx.m("reply", {
    _args: arguments,

    _sign: {
      _rep: _rep
    }
  }));
});

app.listen(8080);
console.log(">> listening 8080");

// reply >> ø

flx.register("reply", function capsule(msg) {
    (function reply(req, res) {
      console.log(msg._sign._rep);
      res.send(msg._sign._rep);
    }).apply(this, msg._args);
});
  var flx = require("./lib/flx");
  var app = require('express')();
  
  app.get("/:id", function placeholder() {
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
        res.send("42");
      }).apply(this, msg._args);
  });
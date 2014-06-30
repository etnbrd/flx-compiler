var flx = require("flx");
var app = require('express')();
var _rep = "42";
app.get("/", ↠reply);
app.listen(8080);
console.log(">> listening 8080");

// reply >> ø

flx.register("reply", function capsule(msg) {
    (function reply(req, res) {
      res.send(msg._sign._rep);
    }).apply(this, msg._args);
});
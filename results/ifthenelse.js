var flx = require("flx");
var app = require('express')();
var cond = false;

if (cond)
    app.get("/", function placeholder() {
        return flx.start(flx.m("reply1", {
            _args: arguments,
            _sign: {}
        }));
    });
else
    // FIX : Fail with the same name / src/pruner/constructors.js:52
    app.get("/", function placeholder() {
        return flx.start(flx.m("reply2", {
            _args: arguments,
            _sign: {}
        }));
    });

if (!module.parent) {
    app.listen(8080);
    console.log(">> listening 8080");
}

exports.app = app;

// reply1 >> ø

flx.register("reply1", function capsule(msg) {
    (function reply1(req, res) {
      var _rep = "42";
      res.send(_rep);
    }).apply(this, msg._args);
}, {});

// reply2 >> ø

flx.register("reply2", function capsule(msg) {
    (function reply2(req, res) {
      var _rep = "101010";
      res.send(_rep);
    }).apply(this, msg._args);
}, {});
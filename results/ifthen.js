var flx = require("flx");
var app = require('express')();
var cond = true;

if (cond)
    app.get("/", function placeholder() {
        return flx.start(flx.m("reply", {
            _args: arguments,
            _sign: {}
        }));
    });

if (!module.parent) {
    app.listen(8080);
    console.log(">> listening 8080");
}

exports.app = app;

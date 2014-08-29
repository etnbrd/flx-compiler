var app = require('express')();
var handler = require('./count8-required');

app.get("/", handler);

if (!module.parent) {
    app.listen(8080);
    console.log(">> listening 8080");
}

exports.app = app;
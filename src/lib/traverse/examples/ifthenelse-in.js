var app = require('express')();
var cond = false;

app.get("/", function reply1(req, res){
    var _rep = null;
    if (cond)
        _rep = "42";
    else
        // FIX : Fail with the same name / src/pruner/constructors.js:52
        _rep = "101010";

    res.send(_rep);
});

if (!module.parent) {
    app.listen(8080);
    console.log(">> listening 8080");
}

exports.app = app;

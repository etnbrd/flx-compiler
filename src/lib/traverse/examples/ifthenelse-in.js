var app = require('express')();
var cond = false;

app.get("/", function reply1(req, res){
    var _rep = null;
    if (cond)
        _rep = 'F';
    else
        _rep = 'G';


    console.log(_rep);

    res.send(_rep);
});

if (!module.parent) {
    app.listen(8080);
    console.log(">> listening 8080");
}

exports.app = app;

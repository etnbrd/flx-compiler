var app = require('express')();

var rep = 42;

var handlers = {
  root: function replyA(req, res){
    rep.count += 1;
    res.send("" + rep.answer);
  }
}

app.get("/", handlers.root);

if (!module.parent) {
    app.listen(8080);
    console.log(">> listening 8080");
}

exports.app = app;
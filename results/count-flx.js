res.send-1000 >> ø
[ 'res', 'count' ]
  function res.send-1000(msg) {
      res.send(count);
  }

id >> res.send-1000 [res,count]
[ 'count' ]
  function id(req, res) {
    count = count + 1;
    flx.post(flx.m("res.send-1000", {
      res: res,
      count: count
    }));
  }

Main >> id [count]
  var flx = require("./lib/flx");
  var app = require('express')();
  var count = 0;
  
  app.get("/:id", function placeholder() {
    return flx.start(flx.m("id", arguments));
  });
  
  app.listen(8080);

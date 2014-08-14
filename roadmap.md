# Todos 

+ Write master subjects about compiler problem spin off (like fluxion placement, debit ...)
  

# Tests 


## counts

### count1


The server reply a constant value to every request
There isn't any variable used



The source program is in `examples/count1.js` : 

```
var app = require('express')();

app.get('/', function reply(req, res){
  res.send('42');
});

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}
exports.app = app;

```

The compiled result is in `results/count1.js` : 

```
var flx = require('flx');
var app = require('express')();
app.get('/', function placeholder() {
  return flx.start(flx.m('reply-1001', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}
exports.app = app;

// reply-1001 >> ø

flx.register('reply-1001', function capsule(msg) {
  if (msg._update) {
    for (var i in msg._update) {
      this[i] = msg._update[i];
    }
  } else {
    (function reply(req, res) {
      res.send('42');
    }.apply(this, msg._args));
  }
}, {});
```


The fluxionnal result is in `results/count1.flx` : 

```
flx reply-1001
→ ø
  function reply(req, res) {
    res.send('42');
  }

flx count1.js
→ ø
  var app = require('express')();
  app.get('/', function placeholder() {
    return flx.start(flx.m('reply-1001', {
      _args: arguments,
      _sign: {}
    }));
  });
  if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
  }
  exports.app = app;
```

### count2


The server reply a constant value to every request,
using a variable declared **inside** the reply function.
This variable shouldn't be exchanged between fluxions
as it's declared and used in the same function.



The source program is in `examples/count2.js` : 

```
var app = require('express')();

app.get('/', function reply(req, res){
  var _rep = '42';
  res.send(_rep);
});

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}

exports.app = app;

```

The compiled result is in `results/count2.js` : 

```
var flx = require('flx');
var app = require('express')();
app.get('/', function placeholder() {
  return flx.start(flx.m('reply-1002', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}
exports.app = app;

// reply-1002 >> ø

flx.register('reply-1002', function capsule(msg) {
  if (msg._update) {
    for (var i in msg._update) {
      this[i] = msg._update[i];
    }
  } else {
    (function reply(req, res) {
      var _rep = '42';
      res.send(_rep);
    }.apply(this, msg._args));
  }
}, {});
```


The fluxionnal result is in `results/count2.flx` : 

```
flx reply-1002
→ ø
  function reply(req, res) {
    var _rep = '42';
    res.send(_rep);
  }

flx count2.js
→ ø
  var app = require('express')();
  app.get('/', function placeholder() {
    return flx.start(flx.m('reply-1002', {
      _args: arguments,
      _sign: {}
    }));
  });
  if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
  }
  exports.app = app;
```

### count3


The server of problem #3 reply a constant value to every request,
using a variable declared **outside** the reply function.
This variable should be in the signature of the second fluxions.



The source program is in `examples/count3.js` : 

```
var app = require('express')();

var _rep = '42';

app.get('/', function reply(req, res){
  res.send(_rep);
});

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}

exports.app = app;
```

The compiled result is in `results/count3.js` : 

```
var flx = require('flx');
var app = require('express')();
var _rep = '42';
app.get('/', function placeholder() {
  return flx.start(flx.m('reply-1003', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}
exports.app = app;

// reply-1003 >> ø

flx.register('reply-1003', function capsule(msg) {
  if (msg._update) {
    for (var i in msg._update) {
      this[i] = msg._update[i];
    }
  } else {
    (function reply(req, res) {
      res.send(this._rep);
    }.apply(this, msg._args));
  }
}, { _rep: _rep });
```


The fluxionnal result is in `results/count3.flx` : 

```
flx reply-1003
→ ø
  function reply(req, res) {
    res.send(this._rep);
  }

flx count3.js
→ ø
  var app = require('express')();
  var _rep = '42';
  app.get('/', function placeholder() {
    return flx.start(flx.m('reply-1003', {
      _args: arguments,
      _sign: {}
    }));
  });
  if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
  }
  exports.app = app;
```

### count4


The server of problem #4 reply a value incremented at every request,
using a variable declared outside the reply function.
This variable should be in the scope of the fluxions
as it is used only in this fluxion.



The source program is in `examples/count4.js` : 

```
var app = require('express')();

var _rep = 42;

app.get('/', function reply(req, res){
  res.send('' + _rep);
  _rep += 1;
});

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}

exports.app = app;

```

The compiled result is in `results/count4.js` : 

```
var flx = require('flx');
var app = require('express')();
var _rep = 42;
app.get('/', function placeholder() {
  return flx.start(flx.m('reply-1004', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}
exports.app = app;

// reply-1004 >> ø

flx.register('reply-1004', function capsule(msg) {
  if (msg._update) {
    for (var i in msg._update) {
      this[i] = msg._update[i];
    }
  } else {
    (function reply(req, res) {
      res.send('' + this._rep);
      this._rep += 1;
    }.apply(this, msg._args));
  }
}, { _rep: _rep });
```


The fluxionnal result is in `results/count4.flx` : 

```
flx reply-1004
→ ø
  function reply(req, res) {
    res.send('' + this._rep);
    this._rep += 1;
  }

flx count4.js
→ ø
  var app = require('express')();
  var _rep = 42;
  app.get('/', function placeholder() {
    return flx.start(flx.m('reply-1004', {
      _args: arguments,
      _sign: {}
    }));
  });
  if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
  }
  exports.app = app;
```

### count5


The server of problem #5 uses two different handler for two different request routes.,
Both handlers modify the same variable, so the fluxions needs to synchronize this value after each modification.



The source program is in `examples/count5.js` : 

```
var app = require('express')();

var _rep = 42;

app.get("/A", function replyA(req, res){
  _rep += 1;
  res.send("" + _rep);
});

app.get("/B", function replyB(req, res){
  _rep += 2;
  res.send("" + _rep);
});

if (!module.parent) {
    app.listen(8080);
    console.log(">> listening 8080");
}

exports.app = app;
```

The compiled result is in `results/count5.js` : 

```
var flx = require('flx');
var app = require('express')();
var _rep = 42;
app.get('/A', function placeholder() {
  return flx.start(flx.m('replyA-1005', {
    _args: arguments,
    _sign: {}
  }));
});
app.get('/B', function placeholder() {
  return flx.start(flx.m('replyB-1006', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}
exports.app = app;

// replyA-1005 >> ø

flx.register('replyA-1005', function capsule(msg) {
  if (msg._update) {
    for (var i in msg._update) {
      this[i] = msg._update[i];
    }
  } else {
    (function replyA(req, res) {
      this._rep += 1;
      res.send('' + this._rep);
    }.apply(this, msg._args));
  }
}, { _rep: _rep });

// replyB-1006 >> ø

flx.register('replyB-1006', function capsule(msg) {
  if (msg._update) {
    for (var i in msg._update) {
      this[i] = msg._update[i];
    }
  } else {
    (function replyB(req, res) {
      this._rep += 2;
      res.send('' + this._rep);
    }.apply(this, msg._args));
  }
}, { _rep: _rep });
```


The fluxionnal result is in `results/count5.flx` : 

```
flx replyA-1005
→ ø
  function replyA(req, res) {
    this._rep += 1;
    res.send('' + this._rep);
  }

flx replyB-1006
→ ø
  function replyB(req, res) {
    this._rep += 2;
    res.send('' + this._rep);
  }

flx count5.js
→ ø
  var app = require('express')();
  var _rep = 42;
  app.get('/A', function placeholder() {
    return flx.start(flx.m('replyA-1005', {
      _args: arguments,
      _sign: {}
    }));
  });
  app.get('/B', function placeholder() {
    return flx.start(flx.m('replyB-1006', {
      _args: arguments,
      _sign: {}
    }));
  });
  if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
  }
  exports.app = app;
```

### count6


Same with objects



The source program is in `examples/count6.js` : 

```
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
```

The compiled result is in `results/count6.js` : 

```
var flx = require('flx');
var app = require('express')();
var rep = 42;
var handlers = {
    root: function replyA(req, res) {
      this.rep.count += 1;
      res.send('' + this.rep.answer);
    }
  };
app.get('/', function placeholder() {
  return flx.start(flx.m('replyA-1007', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}
exports.app = app;

// replyA-1007 >> ø

flx.register('replyA-1007', function capsule(msg) {
  if (msg._update) {
    for (var i in msg._update) {
      this[i] = msg._update[i];
    }
  } else {
    (function replyA(req, res) {
      this.rep.count += 1;
      res.send('' + this.rep.answer);
    }.apply(this, msg._args));
  }
}, { rep: rep });
```


The fluxionnal result is in `results/count6.flx` : 

```
flx replyA-1007
→ ø
  function replyA(req, res) {
    this.rep.count += 1;
    res.send('' + this.rep.answer);
  }

flx count6.js
→ ø
  var app = require('express')();
  var rep = 42;
  var handlers = {
      root: function replyA(req, res) {
        this.rep.count += 1;
        res.send('' + this.rep.answer);
      }
    };
  app.get('/', function placeholder() {
    return flx.start(flx.m('replyA-1007', {
      _args: arguments,
      _sign: {}
    }));
  });
  if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
  }
  exports.app = app;
```

### count7


Same with arrays



the test has not yet be implemented

### count8


Same with requires



The source program is in `examples/count8.js` : 

```
var app = require('express')();
var handler = require('./count8-required');

app.get("/", handler);

if (!module.parent) {
    app.listen(8080);
    console.log(">> listening 8080");
}

exports.app = app;
```

The compiled result is in `results/count8.js` : 

```
var flx = require('flx');
var app = require('express')();
var handler = require('./count8-required');
app.get('/', handler);
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}
exports.app = app;
```


The fluxionnal result is in `results/count8.flx` : 

```
flx count8.js
→ ø
  var app = require('express')();
  var handler = require('./count8-required');
  app.get('/', handler);
  if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
  }
  exports.app = app;
```


## startFluxions

### app.get


The trigger is app.get.
app is directly required in a 'app' var.



The source program is in `examples/app.get.js` : 

```
var app = require('express')();

app.get('/', function reply(req, res){
  var _rep = '42';
  res.send(_rep);
});

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}

```

The compiled result is in `results/app.get.js` : 

```
var flx = require('flx');
var app = require('express')();
app.get('/', function placeholder() {
  return flx.start(flx.m('reply-1008', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}

// reply-1008 >> ø

flx.register('reply-1008', function capsule(msg) {
  if (msg._update) {
    for (var i in msg._update) {
      this[i] = msg._update[i];
    }
  } else {
    (function reply(req, res) {
      var _rep = '42';
      res.send(_rep);
    }.apply(this, msg._args));
  }
}, {});
```


The fluxionnal result is in `results/app.get.flx` : 

```
flx reply-1008
→ ø
  function reply(req, res) {
    var _rep = '42';
    res.send(_rep);
  }

flx app.get.js
→ ø
  var app = require('express')();
  app.get('/', function placeholder() {
    return flx.start(flx.m('reply-1008', {
      _args: arguments,
      _sign: {}
    }));
  });
  if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
  }
```

### application.get


The trigger is application.get.
app is directly required in a 'application' var.



The source program is in `examples/application.get.js` : 

```
var application = require('express')();

application.get('/', function reply(req, res){
  var _rep = '42';
  res.send(_rep);
});

if (!module.parent) {
    application.listen(8080);
    console.log('>> listening 8080');
}

```

The compiled result is in `results/application.get.js` : 

```
var flx = require('flx');
var application = require('express')();
application.get('/', function placeholder() {
  return flx.start(flx.m('reply-1009', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  application.listen(8080);
  console.log('>> listening 8080');
}

// reply-1009 >> ø

flx.register('reply-1009', function capsule(msg) {
  if (msg._update) {
    for (var i in msg._update) {
      this[i] = msg._update[i];
    }
  } else {
    (function reply(req, res) {
      var _rep = '42';
      res.send(_rep);
    }.apply(this, msg._args));
  }
}, {});
```


The fluxionnal result is in `results/application.get.flx` : 

```
flx reply-1009
→ ø
  function reply(req, res) {
    var _rep = '42';
    res.send(_rep);
  }

flx application.get.js
→ ø
  var application = require('express')();
  application.get('/', function placeholder() {
    return flx.start(flx.m('reply-1009', {
      _args: arguments,
      _sign: {}
    }));
  });
  if (!module.parent) {
    application.listen(8080);
    console.log('>> listening 8080');
  }
```


## postFluxions

### fs.readFile


The trigger is fs.readFile.
module is directly required in a 'fs' var.



The source program is in `examples/fs.readFile.js` : 

```
var app = require('express')(),
    fs = require('fs');

app.get('/', function reply(req, res){
  fs.readFile(__filename, function(error, data) {
    res.send(data);
  });
});

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}

```

The compiled result is in `results/fs.readFile.js` : 

```
var flx = require('flx');
var app = require('express')(), fs = require('fs');
app.get('/', function placeholder() {
  return flx.start(flx.m('reply-1010', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}

// anonymous-1011 >> ø

flx.register('anonymous-1011', function capsule(msg) {
  if (msg._update) {
    for (var i in msg._update) {
      this[i] = msg._update[i];
    }
  } else {
    fs.readFile(__filename, function (error, data) {
      this.res.send(data);
    }).apply(this, msg._args);
  }
}, { res: res });

// reply-1010 >> ø

flx.register('reply-1010', function capsule(msg) {
  if (msg._update) {
    for (var i in msg._update) {
      this[i] = msg._update[i];
    }
  } else {
    (function reply(req, res) {
      (function placeholder(__filename, function (error, data) {
        this.res.send(data);
      }) {
        return flx.post(flx.m('anonymous-1011', {
          _args: arguments,
          _sign: {}
        }));
      });
    }.apply(this, msg._args));
  }
}, { fs: fs });
```


The fluxionnal result is in `results/fs.readFile.flx` : 

```
flx anonymous-1011
→ ø
  function (error, data) {
    this.res.send(data);
  }

flx reply-1010
→ ø
  function reply(req, res) {
    (function placeholder(__filename, function (error, data) {
      this.res.send(data);
    }) {
      return flx.post(flx.m('anonymous-1011', {
        _args: arguments,
        _sign: {}
      }));
    });
  }

flx fs.readFile.js
→ ø
  var app = require('express')(), fs = require('fs');
  app.get('/', function placeholder() {
    return flx.start(flx.m('reply-1010', {
      _args: arguments,
      _sign: {}
    }));
  });
  if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
  }
```

### fis.readFile


The trigger is fis.readFile.
module is directly required in a 'fis' var.



The source program is in `examples/fis.readFile.js` : 

```
var app = require('express')(),
    fis = require('fs');

app.get('/', function reply(req, res){
  fis.readFile(__filename, function(error, data) {
    res.send(data);
  });
});

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}

```

The compiled result is in `results/fis.readFile.js` : 

```
var flx = require('flx');
var app = require('express')(), fis = require('fs');
app.get('/', function placeholder() {
  return flx.start(flx.m('reply-1012', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}

// anonymous-1013 >> ø

flx.register('anonymous-1013', function capsule(msg) {
  if (msg._update) {
    for (var i in msg._update) {
      this[i] = msg._update[i];
    }
  } else {
    fis.readFile(__filename, function (error, data) {
      this.res.send(data);
    }).apply(this, msg._args);
  }
}, { res: res });

// reply-1012 >> ø

flx.register('reply-1012', function capsule(msg) {
  if (msg._update) {
    for (var i in msg._update) {
      this[i] = msg._update[i];
    }
  } else {
    (function reply(req, res) {
      (function placeholder(__filename, function (error, data) {
        this.res.send(data);
      }) {
        return flx.post(flx.m('anonymous-1013', {
          _args: arguments,
          _sign: {}
        }));
      });
    }.apply(this, msg._args));
  }
}, { fis: fis });
```


The fluxionnal result is in `results/fis.readFile.flx` : 

```
flx anonymous-1013
→ ø
  function (error, data) {
    this.res.send(data);
  }

flx reply-1012
→ ø
  function reply(req, res) {
    (function placeholder(__filename, function (error, data) {
      this.res.send(data);
    }) {
      return flx.post(flx.m('anonymous-1013', {
        _args: arguments,
        _sign: {}
      }));
    });
  }

flx fis.readFile.js
→ ø
  var app = require('express')(), fis = require('fs');
  app.get('/', function placeholder() {
    return flx.start(flx.m('reply-1012', {
      _args: arguments,
      _sign: {}
    }));
  });
  if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
  }
```


## assignments

### var


The handler is in a var



The source program is in `examples/var.js` : 

```
var app = require('express')();

var reply = function(req, res){
  res.send('42');
};

app.get('/', reply);

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}
exports.app = app;

```

The compiled result is in `results/var.js` : 

```
var flx = require('flx');
var app = require('express')();
var reply = function (req, res) {
  res.send('42');
};
app.get('/', function placeholder() {
  return flx.start(flx.m('reply-1014', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}
exports.app = app;

// reply-1014 >> ø

flx.register('reply-1014', function capsule(msg) {
  if (msg._update) {
    for (var i in msg._update) {
      this[i] = msg._update[i];
    }
  } else {
    (function (req, res) {
      res.send('42');
    }.apply(this, msg._args));
  }
}, {});
```


The fluxionnal result is in `results/var.flx` : 

```
flx reply-1014
→ ø
  function (req, res) {
    res.send('42');
  }

flx var.js
→ ø
  var app = require('express')();
  var reply = function (req, res) {
    res.send('42');
  };
  app.get('/', function placeholder() {
    return flx.start(flx.m('reply-1014', {
      _args: arguments,
      _sign: {}
    }));
  });
  if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
  }
  exports.app = app;
```

### plainfunction


The handler is a plain function



The source program is in `examples/plainfunction.js` : 

```
var app = require('express')();

function reply(req, res){
  res.send('42');
}

app.get('/', reply);

if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
}
exports.app = app;

```

The compiled result is in `results/plainfunction.js` : 

```
var flx = require('flx');
var app = require('express')();
function reply(req, res) {
  res.send('42');
}
app.get('/', function placeholder() {
  return flx.start(flx.m('reply-1015', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}
exports.app = app;

// reply-1015 >> ø

flx.register('reply-1015', function capsule(msg) {
  if (msg._update) {
    for (var i in msg._update) {
      this[i] = msg._update[i];
    }
  } else {
    (function reply(req, res) {
      res.send('42');
    }.apply(this, msg._args));
  }
}, {});
```


The fluxionnal result is in `results/plainfunction.flx` : 

```
flx reply-1015
→ ø
  function reply(req, res) {
    res.send('42');
  }

flx plainfunction.js
→ ø
  var app = require('express')();
  function reply(req, res) {
    res.send('42');
  }
  app.get('/', function placeholder() {
    return flx.start(flx.m('reply-1015', {
      _args: arguments,
      _sign: {}
    }));
  });
  if (!module.parent) {
    app.listen(8080);
    console.log('>> listening 8080');
  }
  exports.app = app;
```


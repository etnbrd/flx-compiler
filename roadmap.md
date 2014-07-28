### Problem #1


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
  return flx.start(flx.m('↠reply', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}
exports.app = app;

// ↠reply >> ø

flx.register('↠reply', function capsule(msg) {
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
flx ↠reply
→ ø
  function reply(req, res) {
    res.send('42');
  }

flx count1.js
↠ ↠reply []
  var app = require('express')();
  app.get('/', function placeholder() {
    return flx.start(flx.m('↠reply', {
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

### Problem #2


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
  return flx.start(flx.m('↠reply', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}
exports.app = app;

// ↠reply >> ø

flx.register('↠reply', function capsule(msg) {
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
flx ↠reply
→ ø
  function reply(req, res) {
    var _rep = '42';
    res.send(_rep);
  }

flx count2.js
↠ ↠reply []
  var app = require('express')();
  app.get('/', function placeholder() {
    return flx.start(flx.m('↠reply', {
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

### Problem #3


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
  return flx.start(flx.m('↠reply', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}
exports.app = app;

// ↠reply >> ø

flx.register('↠reply', function capsule(msg) {
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
flx ↠reply
→ ø
  function reply(req, res) {
    res.send(this._rep);
  }

flx count3.js
↠ ↠reply []
  var app = require('express')();
  var _rep = '42';
  app.get('/', function placeholder() {
    return flx.start(flx.m('↠reply', {
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

### Problem #4


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
  return flx.start(flx.m('↠reply', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}
exports.app = app;

// ↠reply >> ø

flx.register('↠reply', function capsule(msg) {
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
flx ↠reply
→ ø
  function reply(req, res) {
    res.send('' + this._rep);
    this._rep += 1;
  }

flx count4.js
↠ ↠reply []
  var app = require('express')();
  var _rep = 42;
  app.get('/', function placeholder() {
    return flx.start(flx.m('↠reply', {
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

### Problem #5


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
  return flx.start(flx.m('↠replyA', {
    _args: arguments,
    _sign: {}
  }));
});
app.get('/B', function placeholder() {
  return flx.start(flx.m('↠replyB', {
    _args: arguments,
    _sign: {}
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}
exports.app = app;

// ↠replyA >> ø

flx.register('↠replyA', function capsule(msg) {
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

// ↠replyB >> ø

flx.register('↠replyB', function capsule(msg) {
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
flx ↠replyA
→ ø
  function replyA(req, res) {
    this._rep += 1;
    res.send('' + this._rep);
  }

flx ↠replyB
→ ø
  function replyB(req, res) {
    this._rep += 2;
    res.send('' + this._rep);
  }

flx count5.js
↠ ↠replyA []
↠ ↠replyB []
  var app = require('express')();
  var _rep = 42;
  app.get('/A', function placeholder() {
    return flx.start(flx.m('↠replyA', {
      _args: arguments,
      _sign: {}
    }));
  });
  app.get('/B', function placeholder() {
    return flx.start(flx.m('↠replyB', {
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

### Problem #6


Same with objects



the test has not yet be implemented

### Problem #7


Same with arrays



the test has not yet be implemented

### Problem #8


Same with requires



the test has not yet be implemented

### Problem #9


Write a graph printer to display fluxions box and arrows stuffs



the test has not yet be implemented

### Problem #10


Write a communication TODO file to make the roadmap from test and this TODO file
Then, put in this TODO file :
- write documentation about ES* and generally about the compiler
- write master subjects about compiler problem spin off (like fluxion placement, debit ...)



the test has not yet be implemented


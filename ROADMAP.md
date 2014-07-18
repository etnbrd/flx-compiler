### Problem #1


The server reply a constant value to every request.
There isn't any variable used.


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
  (function reply(req, res) {
    res.send('42');
  }.apply(this, msg._args));
}, {});
```

### Problem #2


The server reply a constant value to every request,
using a variable declared **inside** the reply function.  
This variable shouldn't be exchanged between fluxions,
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
  (function reply(req, res) {
    var _rep = '42';
    res.send(_rep);
  }.apply(this, msg._args));
}, {});
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
  (function reply(req, res) {
    res.send(this._rep);
  }.apply(this, msg._args));
}, { _rep: _rep });
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
  (function reply(req, res) {
    res.send('' + this._rep);
    this._rep += 1;
  }.apply(this, msg._args));
}, { _rep: _rep });
```

### Problem #5


The server of problem #5 uses two different handler for two different request routes.
Both handlers modify the same variable, so the fluxions needs to synchronize this value after each modification.


The source program is in `examples/count5.js` : 

```
var app = require('express')();

var _rep = 42;

app.get("/A", function replyA(req, res){
  res.send("" + _rep);
  _rep += 1;
});

app.get("/B", function replyB(req, res){
  res.send("" + _rep);
  _rep += 2;
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
  (function replyA(req, res) {
    res.send('' + _rep);
    _rep += 1;
  }.apply(this, msg._args));
}, {});

// ↠replyB >> ø

flx.register('↠replyB', function capsule(msg) {
  (function replyB(req, res) {
    res.send('' + _rep);
    _rep += 2;
  }.apply(this, msg._args));
}, {});
```


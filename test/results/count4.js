var flx = require('flx');
var app = require('express')();
var _rep = 42;
app.get('/', function placeholder() {
  return flx.start(flx.m('reply', {
    _args: arguments,
    _sign: { _rep: _rep }
  }));
});
if (!module.parent) {
  app.listen(8080);
  console.log('>> listening 8080');
}
exports.app = app;

// reply >> ø

flx.register('reply', function capsule(msg) {
  (function reply(req, res) {
    res.send('' + this._rep);
    this._rep += 1;
  }.apply(this, msg._args));
}, { _rep: _rep });
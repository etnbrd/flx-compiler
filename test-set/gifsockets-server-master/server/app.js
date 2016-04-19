var flx = require('flx');
var uuid = 0;

var express = require('express');
var Gifsocket = require('gifsockets');
var bodyParser = function () {
    var getRawBody = require('raw-body');
    module.exports = function getRawBodyFn(limit) {
      return function saveBody(req, res, next) {
        getRawBody(/*msg._sign.*/req, {
          expected: /*msg._sign.*/req.headers['content-length'],
          limit: limit
        }, function placeholder() {

          // console.log('SENT BUFFER >>>> ', arguments[1].toString());

          req.__flx_uuid__ = ++uuid;

          flx.post(flx.m('express-dispatcher', {
            reason: 'update',
            body: {
              uuid: uuid,
              req: req,
              res: res,
              next: next
            }
          }));

          return flx.start(flx.m('anonymous-1000', {
            _args: arguments,
            _sign: {
              req: req,
              res: res,
              next: next //flx.serializeFn(next)
            }
          }));
        });
      };
    };
    return module.exports;
  }('./utils/body-parser');
var routes = function () {
    var exports = {};
    var module = {exports: exports};

    var GifsocketMiddleware = require('gifsockets-middleware');
    var gifsocketMw = GifsocketMiddleware({
        width: 600,
        height: 380
      });
    Object.getOwnPropertyNames(gifsocketMw).forEach(function (key) {
      exports[key] = gifsocketMw[key];
    });
    var fs = require('fs');
    var jade = require('jade');
    function renderView(filepath, locals) {
      var file = fs.readFileSync(filepath, 'utf8');
      return jade.render(file, locals);
    }
    var indexHtml = renderView(__dirname + '/../views/index.jade', {});
    exports.index = function (req, res) {
      /*msg._sign.*/res.send(indexHtml);
    };
    var pageNotFoundHtml = renderView(__dirname + '/../views/404.jade', {});
    exports[404] = function (req, res) {
      /*msg._sign.*/res.status(404);
      /*msg._sign.*/res.send(pageNotFoundHtml);
    };
    return module.exports;
  }('./routes');
function GifServer(port) {
  var gifsocket = new Gifsocket({
      width: 600,
      height: 380
    });
  var app = express();
  app.use('/public', express['static'](__dirname + '/../public'));
  app.use(function saveConnections(req, res, next) {
    /*msg._sign.*/req.gifsocket = gifsocket;
    /*msg._sign.*/next();
  });
  app.get('/', routes.index);
  app.get('/image.gif', routes.openImage);
  app.post('/image/text', bodyParser(1 * 1024 * 1024), routes.writeTextToImages);
  app.post('/image/json', bodyParser(10 * 1024 * 1024), routes.writeJsonToImages);
  app.post('/image/close', routes.closeOpenImages);

  app.all('*', routes[404]);
  this.app = app;
}
GifServer.prototype = {
  listen: function (port) {
    this._app = this.app.listen(port);
  },
  destroy: function (cb) {
    this._app.close(cb || function () {
    });
  }
};
module.exports = GifServer;

// anonymous-1000 -> null

flx.register('anonymous-1000', function capsule(msg) {


  /* When I serialize / deserialize next, it removes its closure.
     So, in addition to scope leaking, there is closure leaking as well, or it might just be the same thing.
     So, another way to leak scope, is to return a closure.

  */


  // msg._sign.next = this.deserializeFn(msg._sign.next);

  // Because Arrays are serialized /  deserialize into a regular object.
  msg._args[1] = new Buffer(msg._args[1]);
  var args = [msg._args[0], msg._args[1]];

  return (function (err, buffer) {

    //console.log('ARGS >>>> ', arguments);

    if (err) {
      msg._sign.res.writeHead(500, { 'content-type': 'text/plain' });
      return msg._sign.res.end('Content was too long');
    }
    msg._sign.req.body = buffer;
    // msg._sign.next();

    this.next(msg._sign.req, msg._sign.res);

    // this.post(this.m('express-dispatcher', {req: msg._sign.req, res: msg._sign.res}));

    // return this.m('express-dispatcher', {req: msg._sign.req, res: msg._sign.res});

  }.apply(this, args));
}, {
  // req: req,
  // next: next
}, 'minion');
//});
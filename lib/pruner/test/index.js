require('blanket')({
  pattern: function (filename) {
    return !/node_modules/.test(filename);
  }
});

var pruner = require('..'),
    esprima = require('esprima'),
    assert = require('assert'),
    generateFluxionName = require('../../lib/helpers').generateFluxionName,
    isMatchingFluxionName = require('../../lib/helpers').isMatchingFluxionName;


function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function codeGen(name, o) {
  
  var codes = {
    appName: function(o) {
      return [
        'var ' + o.name + ' = require(\'express\')();'
      ].join('\n');
    },

    simple: function(o) {
      return [
        'var app = require(\'express\')();',
        'app.get(\'/\', function ' + o.name + '(req, res){',
        '  res.send(\'42\');',
        '});',
        'app.listen(8080);'
      ].join('\n');
    }

  }

  return codes[name](o);
}

describe('Pruner', function() {

  /*
    From an AST, the pruner generate an object describing the fluxions scopes.

    It detect fluxions.

  */

  describe('Express Library', function() {
    it('should detect the name of the express application', function() {
      var appname = makeid();
      var filename = makeid();
      var code = codeGen('appName', {name: appname});
      var ctx = pruner(esprima.parse(code), filename);
      assert.deepEqual(ctx.fluxionTriggers[0], appname);

    });
  });

  describe('Fluxions', function() {
    it('should be detected', function() {
      var filename = makeid(),
          flxname = makeid(),
          code = codeGen('simple', {name: flxname}),
          ctx = pruner(esprima.parse(code), filename);
      assert.equal(Object.keys(ctx.flx)[1], filename);
      assert(isMatchingFluxionName(flxname, Object.keys(ctx.flx)[0]));
    });
  });

  describe('Outputs', function() {
    it('should link fluxions together', function() {
      var filename = makeid(),
          flxname = makeid(),
          code = codeGen('simple', {name: flxname}),
          ctx = pruner(esprima.parse(code), filename);
      assert(isMatchingFluxionName(flxname, ctx.flx[filename].outputs[0].name));
    });

    it('should be of different type according to the name of the called asynchronous function in the source fluxion', function() {
      var filename = makeid(),
          flxname = makeid(),
          code = codeGen('simple', {name: flxname}),
          ctx = pruner(esprima.parse(code), filename);
      assert.equal(ctx.flx[filename].outputs[0].type, 'start');

      // TODO 'post'
    });
  });

  // TODO verify that variables are correctly registered as modified or pristine

});

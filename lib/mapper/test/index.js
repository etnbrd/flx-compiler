require('blanket')({
  pattern: function (filename) {
    return !/node_modules/.test(filename);
  }
});

var mapper = require('..'),
    analyzer = require('../../analyzer'),
    esprima = require('esprima'),
    assert = require('assert'),
    isMatchingFluxionName = require('../../lib/helpers').isMatchingFluxionName;


function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var codeGen = {
  declaration: function(name, lib) {
    return [
      'var ' + name + ' = require(\'' + lib + '\')();'
    ].join('\n');
  },

  simple: function(name, lib) {
    return [
      codeGen.declaration('app', lib),
      'app.get(\'/\', function ' + name + '(req, res){',
      '  res.send(\'42\');',
      '});',
      'app.listen(8080);'
    ].join('\n');
  }
};

describe('Mapper', function() {

  /*
    From an AST, the mapper generate an object describing the fluxions scopes.

    It detect fluxions.

  */

  describe('Fluxion Start detection', function() {
    describe('Express Library', function() {
      it('should detect the name of the express application', function() {
        var appname = makeid(),
            filename = makeid(),
            code = codeGen.declaration(appname, 'express'),
            ctx = analyzer(esprima.parse(code), filename);
        ctx = mapper(ctx);
        assert.deepEqual(ctx.flxTriggers.startTriggers[0], appname);

      });
    });
  });

  describe('Fluxion Post detection', function() {
    describe('fs Library', function() {
      it('should detect the name of post', function() {
        var libname = makeid(),
            filename = makeid(),
            code = codeGen.declaration(libname, 'fs'),
            ctx = analyzer(esprima.parse(code), filename);
        ctx = mapper(ctx);
        assert.deepEqual(ctx.flxTriggers.postTriggers[0], libname);

      });
    });
  });

  describe('Fluxions', function() {
    it('should be detected', function() {
      var filename = makeid(),
          flxname = makeid(),
          code = codeGen.simple(flxname, 'express'),
          ctx = analyzer(esprima.parse(code), filename);
      ctx = mapper(ctx);
      assert.equal(Object.keys(ctx.flx)[1], filename);
      assert(isMatchingFluxionName(flxname, Object.keys(ctx.flx)[0]));
    });
  });

  describe('Rupture Points', function() {
    it('should link fluxions together', function() {
      var filename = makeid(),
          flxname = makeid(),
          code = codeGen.simple(flxname, 'express'),
          ctx = analyzer(esprima.parse(code), filename);
      ctx = mapper(ctx);

      assert(isMatchingFluxionName(flxname, ctx.flx[filename].children[0].flx.name));
    });

    it('should be of different type according to the name of the called asynchronous function in the source fluxion', function() {
      var filename = makeid(),
          flxname = makeid(),
          code = codeGen.simple(flxname, 'express'),
          ctx = analyzer(esprima.parse(code), filename);
      ctx = mapper(ctx);

      assert.equal(ctx.flx[filename].children[0].rupturePoint.type, 'start');
    });
  });

  // TODO verify that variables are correctly registered as modified or pristine

});

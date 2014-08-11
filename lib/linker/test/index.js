require('blanket')({
  pattern: function (filename) {
    return !/node_modules/.test(filename);
  }
});

var linker = require('..'),
    analyzer = require('../../analyzer'),
    mapper = require('../../mapper'),
    esprima = require('esprima'),
    assert = require('assert'),
    getValueFromMatchingFluxionNameKey = require('../../lib/helpers').getValueFromMatchingFluxionNameKey;

function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var codeGen = {
  simple: function(name) {
    return [
      'var app = require(\'express\')();',
      'var ' + name + ' = \'42\'',
      'app.get(\'/\', function reply(req, res){',
      '  res.send(' + name + ');',
      '});',
      'app.listen(8080);'
    ].join('\n');
  },
  double: function(name) {
    return [
      'var app = require(\'express\')();',
      'var ' + name + ' = \'42\'',
      'app.get(\'/A\', function replyA(req, res){',
      '  res.send(' + name + ');',
      '});',
      'app.get(\'/B\', function replyB(req, res){',
      '  res.send(' + name + ');',
      '});',
      'app.listen(8080);'
    ].join('\n');
  },
  modification: function(name) {
    return [
      'var app = require(\'express\')();',
      'var ' + name + ' = 42',
      'app.get(\'/A\', function replyA(req, res){',
      '  res.send(' + name + '++);',
      '});',
      'app.get(\'/B\', function replyB(req, res){',
      '  res.send(' + name + '++);',
      '});',
      'app.listen(8080);'
    ].join('\n');
  }
};

describe('Linker', function() {
  it('should put a variable in scope, if used by only one fluxion', function() {
    var varname = makeid(),
        code = codeGen.simple(varname),
        ctx = analyzer(esprima.parse(code), 'simple');

    ctx = linker(mapper(ctx));

    assert.notEqual(getValueFromMatchingFluxionNameKey(ctx.flx, 'reply').scope[varname], undefined);
  });

  it('should put a variable in scope, if used by at least two fluxion, but not modified', function() {
    var varname = makeid(),
        code = codeGen.double(varname),
        ctx = analyzer(esprima.parse(code), 'double');

    ctx = linker(mapper(ctx));

    assert.notEqual(getValueFromMatchingFluxionNameKey(ctx.flx, 'replyA').scope[varname], undefined);
    assert.notEqual(getValueFromMatchingFluxionNameKey(ctx.flx, 'replyB').scope[varname], undefined);
  });

  it('should put a variable in sync, if used and modified by at least two fluxion', function() {
    var varname = makeid(),
        code = codeGen.modification(varname),
        ctx = analyzer(esprima.parse(code), 'double');

    ctx = linker(mapper(ctx));

    assert.notEqual(getValueFromMatchingFluxionNameKey(ctx.flx, 'replyA').sync[varname], undefined);
    assert.notEqual(getValueFromMatchingFluxionNameKey(ctx.flx, 'replyB').sync[varname], undefined);
  });
});

require('blanket')({
  pattern: function (filename) {
    return !/node_modules/.test(filename);
  }
});

var linker = require('..'),
    pruner = require('../../pruner'),
    esprima = require('esprima'),
    assert = require('assert');


function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function codeGen(name, o) {
  
  var codes = {
    simple: function(o) {
      return [
        'var app = require(\'express\')();',
        'var ' + o.name + ' = \'42\'',
        'app.get(\'/\', function reply(req, res){',
        '  res.send(' + o.name + ');',
        '});',
        'app.listen(8080);'
      ].join('\n');
    },
    double: function(o) {
      return [
        'var app = require(\'express\')();',
        'var ' + o.name + ' = \'42\'',
        'app.get(\'/A\', function replyA(req, res){',
        '  res.send(' + o.name + ');',
        '});',
        'app.get(\'/B\', function replyB(req, res){',
        '  res.send(' + o.name + ');',
        '});',
        'app.listen(8080);'
      ].join('\n');
    },
    modification: function(o) {
      return [
        'var app = require(\'express\')();',
        'var ' + o.name + ' = 42',
        'app.get(\'/A\', function replyA(req, res){',
        '  res.send(' + o.name + '++);',
        '});',
        'app.get(\'/B\', function replyB(req, res){',
        '  res.send(' + o.name + '++);',
        '});',
        'app.listen(8080);'
      ].join('\n');
    }
  }

  return codes[name](o);
}

describe('Linker', function() {
  it('should put a variable in scope, if used by only one fluxion', function() {
    var varname = makeid(),
        code = codeGen('simple', {name: varname}),
        ctx = linker(pruner(esprima.parse(code), 'simple'));

    assert.notEqual(ctx.flx['↠reply'].scope[varname], undefined);
  })

  it('should put a variable in scope, if used by at least two fluxion, but not modified', function() {
    var varname = makeid(),
        code = codeGen('double', {name: varname}),
        ctx = linker(pruner(esprima.parse(code), 'double'));

    assert.notEqual(ctx.flx['↠replyA'].scope[varname], undefined);
    assert.notEqual(ctx.flx['↠replyB'].scope[varname], undefined);
  })

  it('should put a variable in sync, if used and modified by at least two fluxion', function() {
    var varname = makeid(),
        code = codeGen('modification', {name: varname}),
        ctx = linker(pruner(esprima.parse(code), 'double'));

    assert.notEqual(ctx.flx['↠replyA'].sync[varname], undefined);
    assert.notEqual(ctx.flx['↠replyB'].sync[varname], undefined);
  })
})
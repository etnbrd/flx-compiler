var _print = require('recast').print
,   bld = require('./builders')
// ,   commonMapper = require('../lib/tools').commonMapper
,   iterators = require('../lib/iterators')
,   map = require('../lib/traverse').map
;

module.exports = link;

function print(ast) {
  return _print(ast).code;
}

function link(ctx) {

  // Add the flx library
  ctx.ast.program.body.unshift(bld.requireflx());

  // var ast = commonMapper(ctx._flx.Main.ast);
  var ast = map(ctx._flx.Main.ast, iterators.linker());

  var code = print(ast);

  for (var _flx in ctx._flx) { var flx = ctx._flx[_flx];
    if (flx.name !== "Main") {

      // var pre = commonMapper(flx.ast);


      var _code = print(bld.register(flx.name, map(flx.ast, iterators.linker()), flx.scope));

      // This is only the comment :
      code += "\n\n// " + flx.name + " >> " + ((flx.outputs.length) ? flx.outputs.map(function(o) {return o.name + " [" + Object.keys(o.signature) + "]"}).join(", ") : "ø") + "\n\n" + _code;
    }
  }

  return code;
}
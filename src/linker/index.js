var _print = require('recast').print
,   bld = require('./builders')
,   commonMapper = require('../lib/tools').commonMapper
;

module.exports = link;

function print(ast) {
  return _print(ast).code;
}

function link(ctx) {

  // Add the flx library
  ctx.ast.program.body.unshift(bld.requireflx());

  var ast = commonMapper(ctx._flx.Main.ast);

  var code = print(ast);

  for (var _flx in ctx._flx) { var flx = ctx._flx[_flx];
    if (flx.name !== "Main") {

      // var pre = commonMapper(flx.ast);

      var _code = print(bld.register(flx.name, commonMapper(flx.ast), flx.scope));

      // This is only the comment :
      code += "\n\n// " + flx.name + " >> " + ((flx.outputs.length) ? flx.outputs.map(function(o) {return o.name + " [" + Object.keys(o.signature) + "]"}).join(", ") : "ø") + "\n\n" + _code;
    }
  }

  return code;
}


_types = {};
_types.Identifier = {

  enter: function(n) {

    if (n.modifier) {
      if (n.modifier.target === "signature") {
        return bld.signatureModifier(n.name);
      }

      if (n.modifier.target === "scope") {
        return bld.scopeModifier(n.name);
      }
    }

    if (n.kind === "start"){
      return bld.start(n.name.substring(1), n.signature);
    }

    if (n.kind === "post"){
      return bld.post(n.name.substring(1), n.signature);
    }
  }
}

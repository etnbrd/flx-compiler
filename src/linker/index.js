var _print = require("recast").print;
var map = require("../lib/traverse").map;
var bld = require("./builders");

module.exports = link;

function prelink(ast) {
    function handle(type) {
        return function(n) {
          if (!n.type)
            throw errors.missingType(n);

            if (!!_types[n.type] && _types[n.type][type])
                return _types[n.type][type](n);
        }
    }

    return map(ast, {
        enter: handle('enter'),
        leave: handle('leave')
    })
}

function print(ast) {
  return _print(ast).code;
}

function link(ctx) {

  // Add the flx library
  ctx.ast.program.body.unshift(bld.requireflx());

  var ast = prelink(ctx._flx.Main.ast);

  var code = print(ast);

  for (var _flx in ctx._flx) { var flx = ctx._flx[_flx];
    if (flx.name !== "Main") {

      // var pre = prelink(flx.ast);

      var _code = print(bld.register(flx.name, prelink(flx.ast), flx.scope));

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

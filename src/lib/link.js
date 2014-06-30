var _print = require("recast").print;
var b = require("./builders");
var map = require("./traverse").map;
var red = require("./traverse").reduce;
var bld = require("./builders");

module.exports = link;

function prelink(ast) {

  function _iterator(c) {
    function handled(n, type) {
      if (!n.type)
        throw errors.missingType(n);

      return !!_types[n.type] && _types[n.type][type]
    }

    function _enter(n) {
      if (handled(n, "enter"))
        return _types[n.type].enter(n);
    }

    function _leave(n) {
      if (handled(n, "leave"))
        return _types[n.type].leave(n);
    }

    return {
      enter: _enter,
      leave: _leave
    }
  }


  ast = map(ast, _iterator());

  return ast;
}

function print(ast) {
  return _print(ast).code;
}

function link(ctx) {

  var ast = prelink(ctx._flx.Main.ast);

  var code = print(ast);

  for (var _flx in ctx._flx) { var flx = ctx._flx[_flx];
    if (flx.name !== "Main") {

      // var pre = prelink(flx.ast);

      var _code = print(b.register(flx.name, flx.ast));

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
      return n.modifier;
    }

    if (n.kind === "start"){
      return bld.start(n.name.substring(1), n.signature);
    }

    if (n.kind === "post"){
      return bld.post(n.name.substring(1), n.signature);
    }
  }
}
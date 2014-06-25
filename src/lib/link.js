var print = require("recast").print;
var b = require("./builders");

module.exports = link;

function link(ctx) {
  var code = print(ctx._flx.Main.ast).code;

  for (var _flx in ctx._flx) { var flx = ctx._flx[_flx];
    if (flx.name !== "Main") {

      var _code = print(b.register(flx.name, flx.ast)).code;

      code += "\n\n// " + flx.name + " >> " + ((flx.outputs.length) ? flx.outputs.map(function(o) {return o.name + " [" + Object.keys(o.signature) + "]"}).join(", ") : "ø") + "\n\n" + _code;
    }
  }

  return code;
}

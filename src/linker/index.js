var escodegen = require("escodegen")
,   bld = require("./builders")
//,    map = require("../lib/traverse").map
,   iterator = require("./iterators/main")
,   estraverse = require("estraverse")
,   util = require("util")
;


const options = {
  format: {
    indent: {
      style: '  ',
      base: 0,
      adjustMultilineComment: false
    },
    newline: '\n',
    space: ' ',
    json: false,
    renumber: false,
    hexadecimal: false,
    quotes: 'single',
    escapeless: true,
    compact: false,
    parentheses: true,
    semicolons: true,
    safeConcatenation: false
  },
  moz: {
    starlessGenerator: false,
    parenthesizedComprehensionBlock: false,
    comprehensionExpressionStartsWithAssignment: false
  },
  parse: null,
  comment: false,
  sourceMap: undefined,
  sourceMapRoot: null,
  sourceMapWithCode: false,
  // sourceContent: originalSource, // TODO
  directive: false,
  verbatim: undefined
}

function print(ast) {
  return escodegen.generate(ast, options);
}

function printFlx(flx) { // TODO this belongs in the flx printer
  if (flx.outputs.length) {
    return flx.outputs.map(function (o) {
      return o.name + " [" + Object.keys(o.signature) + "]";
    }).join(", ");
  }
  else {
    return "ø";
  }
}

function link(ctx) {

  // console.log(ctx);
  var code = "";

  for (var _flx in ctx.flx) {
    var flx = ctx.flx[_flx]
    ,   _ast = estraverse.replace(flx.ast, iterator(flx))
    ;

    if (flx.root) {
      // Add the flx library
      _ast.body.unshift(bld.requireflx());

      code = print(_ast) + code;
    } else {

      var _ast = bld.register(flx.name, _ast, flx.scope);
      var _code = print(_ast);

      // This is only the comment :
      code += "\n\n// " + flx.name + " >> " + printFlx(flx) + "\n\n" + _code;
    }
  }

  return code;
}

module.exports = link;
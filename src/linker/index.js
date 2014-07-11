var escodegen = require("escodegen")
,    bld = require("./builders")
//,    map = require("../lib/traverse").map
,    iterator = require("./iterators/main")
,    estraverse = require("estraverse")
,    util = require("util")
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

function printFlx(flx) {
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

  // Add the flx library
  ctx.ast.body.unshift(bld.requireflx());

  var ast = estraverse.replace(ctx._flx.Main.ast, iterator(ctx._flx.Main));

  var code = print(ast);

  for (var _flx in ctx._flx) {
    var flx = ctx._flx[_flx];
    if (flx.name !== "Main") {

      var _ast = estraverse.replace(flx.ast, iterator(flx));
      var _code = print(bld.register(flx.name, _ast, flx.scope));

      // This is only the comment :
      code += "\n\n// " + flx.name + " >> " + printFlx(flx) + "\n\n" + _code;
    }
  }

  return code;
}

module.exports = link;
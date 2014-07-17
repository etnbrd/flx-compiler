var escodegen = require("escodegen"),
    bld = require("./builders"),
    iterator = require("./iterators/main"),
    estraverse = require("estraverse");

module.exports = print;

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
};


function printAst(ast) {
  return escodegen.generate(ast, options);
}

function printFlx(flx) { // TODO this belongs in the flx printer
  if (flx.outputs.length) {
    return flx.outputs.map(function (obj) {
      return obj.name + ' [' + Object.keys(obj.signature) + ']';
    }).join(', ');
  }
  else {
    return 'ø';
  }
}

function print(ctx) {

  var _flx,
      code = "";


  for (_flx in ctx.flx) {
    flx = ctx.flx[_flx];


    _ast = estraverse.replace(flx.ast, iterator(flx));

    if (flx.root) {
      // Add the flx library
      _ast.body.unshift(bld.requireflx());

      code = printAst(_ast) + code;
    } else {

      _ast = bld.register(flx.name, _ast, flx.scope);

      // This is only the comment :
      code += "\n\n// " + flx.name + " >> " + printFlx(flx) + "\n\n" + printAst(_ast);
    }  
  }

  return code;
}
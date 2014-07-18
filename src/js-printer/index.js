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
      _ast,
      root,
      flxRegistrations = "",
      code = "";

  var asts = [];

  for (_flx in ctx.flx) {
    flx = ctx.flx[_flx];


    _ast = estraverse.replace(flx.ast, iterator(flx));

    // TODO sync the dependencies that need it.
    if (_ast.type === "FunctionExpression") {
      _ast.body.body.push(bld.syncBuilder(flx.sync, flx));
    }

    if (flx.root) {
      root = flx;
    } else {

      var _scope = {};

      for (var i in flx.scope) {
        _scope[i] = true;
      }

      for (var i in flx.sync) {
        _scope[i] = true;
      }

      _ast = bld.register(flx.name, _ast, _scope);

      asts.push(_ast);

      code += "\n\n// " + flx.name + " >> " + printFlx(flx) + "\n\n" + printAst(_ast);
    }
  }
  
  // asts.forEach(function(ast) {
  //   root.ast.body.push(ast);
  // })

  // _ast = bld.register(flx.name, bld.fnCapsule(root.ast.body), flx.scope);

  // code = printAst(_ast);
  code = printAst(root.ast) + code;

  code = printAst(bld.requireflx()) + "\n" + code;
   // + "\n" + printAst(bld.starter(root.name));

  return code;
}
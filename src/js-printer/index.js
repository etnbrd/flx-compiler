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


  for (_flx in ctx.flx) {
    flx = ctx.flx[_flx];


    _ast = estraverse.replace(flx.ast, iterator(flx));

    // TODO sync the dependencies that need it.
    // if (_ast.type === "FunctionExpression") {
    //   _ast.body.body.push(bld.syncBuilder(flx.sync));
    // }

    if (flx.root) {
      root = flx;
    } else {
      _ast = bld.register(flx.name, _ast, flx.scope);


      // TODO we want to put every fluxion registration inside the root fluxion (mainly to avoid dependencies problems while registering scopes from rooted variable).
      // we need to find the root flx, encapsulated it, push every other regstration at the top in the ast, then print everything.
      // so find the root, encapsulate it, find every other flx, register them, and shift them in the body, print, done.

      code += "\n\n// " + flx.name + " >> " + printFlx(flx) + "\n\n" + printAst(_ast);
    }
  }
  
  _ast = bld.register(flx.name, bld.fnCapsule(flx.ast.body), flx.scope);

  code = printAst(bld.requireflx()) + "\n" + code + "\n" + printAst(bld.starter(rootName));

  return code;
}
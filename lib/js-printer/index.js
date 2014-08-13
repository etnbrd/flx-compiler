'use strict';

var escodegen = require('escodegen'),
    bld = require('./builders'),
    iterator = require('./iterator'),
    estraverse = require('estraverse');

var options = {
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

  var i,
      flx,
      _flx,
      _ast,
      _scope,
      root,
      // asts = [],
      code = '';

  for (_flx in ctx.flx) {
    flx = ctx.flx[_flx];

    _ast = estraverse.replace(flx.ast, iterator(flx));
    
    if (_ast.type === 'FunctionExpression' && flx.sync.length) {
      _ast.body.body.push(bld.syncBuilder(flx.sync, flx));
    }

    if (flx.root) {
      root = flx;
    } else {

      _scope = {};

      for (i in flx.scope) {
        _scope[i] = true;
      }

      for (i in flx.sync) {
        _scope[i] = true;
      }

      _ast = bld.register(flx.name, _ast, _scope);

      code += '\n\n// ' + flx.name + ' >> ' + printFlx(flx) + '\n\n' + printAst(_ast);
    }
  }
  
  return printAst(bld.requireflx()) + '\n' + printAst(root.ast) + code;
}

module.exports = print;
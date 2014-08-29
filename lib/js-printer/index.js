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
  if (flx.children.length) {
    return flx.children.map(function (obj) {
      var arrow = {
        start: ' >> ',
        post: ' -> '
      }

      function depType(type) {
        return function(name) {
          return name + '(' + type + ')';
        }
      }

      var dep = Object.keys(obj.flx.signature).map(depType('signature'))
        .concat(Object.keys(obj.flx.scope).map(depType('scope'))
        .concat(Object.keys(obj.flx.sync).map(depType('sync'))))

      return '\n//' + arrow[obj.rupturePoint.type] + obj.flx.name + ' [' + dep.join(', ') + ']';
    }).join(', ');
  }
  else {
    return ' -> ø';
  }
}

function print(ctx, skipRoot) {

  var i,
      flx,
      _flx,
      _ast,
      _scope,
      root,
      // asts = [],
      code = '';

  // console.log(ctx.flx);

  for (_flx in ctx.flx) {
    flx = ctx.flx[_flx];

    _ast = estraverse.replace(flx.ast, iterator(flx));
    
    // TODO what is this for ?
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

      if (flx.rupturePoint.type === 'post') {
        _ast = bld.register(flx.name, flx.rupturePoint.call, _scope);
      }

      if (flx.rupturePoint.type === 'start') {
        _ast = bld.register(flx.name, _ast, _scope);
      }

      code += '\n\n// ' + flx.name + printFlx(flx) + '\n\n' + printAst(_ast);
    }
  }
  
  // TODO sloppy work, please refactor that, thanks :)
  if (skipRoot === undefined) {
    code = printAst(bld.requireflx()) + '\n' + printAst(root.ast) + code;
  }

  return ctx.requires.reduce(function(_files, _ctx) {
    return _files.concat(print(_ctx, true));
  }, [{
    filename: ctx.name,
    dirname: ctx.dirname,
    code: code
  }]);
 }

module.exports = print;
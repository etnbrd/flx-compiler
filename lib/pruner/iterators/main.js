var esprima = require('esprima'),
  iteratorFactory = require('../../lib/iterators'),
  estraverse = require('estraverse'),
  getIdIterator = require('./getid'),
  Context = require('../context'),
  h = require('../../lib/helpers');

var _types = {};

_types.FunctionDeclaration = 
_types.FunctionExpression = 
_types.Program = {
  enter: function (n, p, c) {
    c.enterScope(n);
  },
  leave: function (n, p, c) {
    c.leaveScope(n);
  }
};

//   variableDeclarator(patt, init[, loc])
_types.VariableDeclarator = {
  enter: function (n, p, c) {
    if (n.init.type === 'CallExpression'
    &&  n.init.callee.callee
    &&  n.init.callee.callee.name === 'require'
    &&  n.init.callee.arguments[0].value === 'express')
      c.registerFluxionTrigger(n.id.name);
  }
};

//   callExpression(callee, args[, loc])
_types.CallExpression = {
  enter: function (n, p, c) {
    // TODO this is bad design
    var _c = {ids: []};
    estraverse.traverse(n.callee, getIdIterator(_c));

    if (_c.ids[0] === 'require' && n.arguments.length > 0 && n.arguments[0].value[0] === '.') {

      var filename = n.arguments[0].value;

      if (filename.lastIndexOf('.js') !== filename.length - 3) {
        filename = filename + '.js';
      }

      // TODO need heavy refactoring :
      // + we shouldn't have to use esprima here
      // + we shouldn't directly push stuffs in c.children,
      // + what to do with the context.children ??
      // TODO dynamic path instead of this "./examples/"
      var file = require('fs').readFileSync("./examples/" + filename).toString();
      var ast = esprima.parse(file);

      var context = new Context(ast, filename);

      c.children.push({
        name: filename,
        scope: c.currentScope,
        astNode: n,
        context: context
      });

      estraverse.traverse(ast, mainIterator(context));
      context.end();
    }

    if (c.isFluxionTrigger(_c.ids)) { // STARTERS
      n.arguments.forEach(function (_n, i) {
        if (_n.type === 'FunctionExpression' || _n.type === 'FunctionDeclaration') {

          var name = h.generateFluxionName(_n.id.name);

          n.arguments[i] = {
            type: 'Identifier',
            name: name,
            kind: 'start'
          };

          c.enterFlx(name, _n, 'start');
          estraverse.traverse(_n, mainIterator(c));
          c.leaveFlx();

          // n.arguments[i].skip(); // TODO
        }
      });
    }
  }
};

_types.UpdateExpression =
_types.AssignmentExpression = {
  enter: function (n, p, c) {

    // MemberExpression || UpdateExpression
    var id = n.left || n.argument;

    if (id.type === 'MemberExpression') {
      id = id.object;
    }

    if (id && !c.isReservedIdentifier(id.name)) {
      c.registerModification(id);
    }
  }
};

var mainIterator = iteratorFactory(_types);

module.exports = mainIterator;

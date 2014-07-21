var iteratorFactory = require('../../lib/iterators'),
  estraverse = require('estraverse'),
  getIdIterator = require('./getid'),
  h = require('../../lib/helpers');

function reserved(name) { // TODO find a better place for this function
  return !!(name === 'require' || name === 'exports' || name === 'module' || name === 'console');
}

var _types = {};

_types.Program = {
  enter: function (n, p, c) {
    c.enterScope(n);
  },
  leave: function (n, p, c) {
    c.leaveScope(n);
  }
};

_types.FunctionDeclaration = _types.Program;
_types.FunctionExpression = _types.Program;


//   variableDeclarator(patt, init[, loc])
_types.VariableDeclarator = {
  enter: function (n, p, c) {
    if (n.init.type === 'CallExpression'
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

    if (c.isFluxionTrigger(_c.ids)) { // STARTERS
      n.arguments.forEach(function (_n, i) {
        if (_n.type === 'FunctionExpression' || _n.type === 'FunctionDeclaration') {

          var name = '↠' + _n.id.name; // TODO this should be an helper function to generate names
          // TODO maybe, fluxion names shouldn't start with this character.
          // This character means 'start', a fluxion name should'nt be representative of that, the output should.

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

    if (id.type === "MemberExpression") {
      id = id.object;
    }

    if (id && !reserved(id.name)) {
      c.registerModification(id);
    }
  }
};

var mainIterator = iteratorFactory(_types);

module.exports = mainIterator;
var fs = require('fs'),
    path = require('path'),

    esprima = require('esprima'),
    estraverse = require('estraverse'),
    
    iteratorFactory = require('../lib/iterators'),
    getIdIterator = require('./getid'),

    h = require('./helpers');

var _types = {};

_types.FunctionDeclaration = 
_types.FunctionExpression = 
_types.CatchClause =
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
    if (n.init && n.init.type === 'CallExpression') {
      var requireStmt = n.init.callee;
      if (!requireStmt.callee)
          requireStmt = n.init; // TODO track variables. This line handle the case `require('express')()`, it breaks in this case `var ex = require('express'); var app = ex();`

      if (requireStmt.callee.name === 'require') {
        c.flxTriggers.registerTrigger(requireStmt.arguments[0].value, n.id.name);
      }
    }

    // TODO register initialisation as a modification.
  }
};

//   callExpression(callee, args[, loc])
_types.CallExpression = {
  enter: function (n, p, c) {

    if (n.callee.name === 'require') {
      c.processRequire(n);
    }

    c.registerModification(n.callee, {
      init: undefined
    });

    var type = c.flxTriggers.typeOf(h.collectId(n.callee).ids);

    if (type) {
      n.arguments.forEach(function(arg, i) {
        var fn = c.isFunction(arg);

        if (fn) {
          c.placeRupturePoint(fn, n, i, type);
        }
      })
    }

  }
};

_types.UpdateExpression =
_types.AssignmentExpression = {
  enter: function (n, p, c) {

    // MemberExpression || UpdateExpression
    var id = n.left || n.argument;
    var init = n.right || n.operator;

    if (id.type === 'MemberExpression') {
      id = id.object;
    }

    if (id && !c.flxTriggers.isReservedIdentifier(id.name)) {

      console.log("register modification", id);

      c.registerModification(id, {
        init: init,
        // fn: c.isFunction(init)
      });
    }

    // TODO detect if a function is assigned to a variable, see context.js.
    // if (c.isFunction(n.right.type)) {
    //   c.registerFunction(id);
    // }
  }
};

var mainIterator = iteratorFactory(_types);

module.exports = mainIterator;

var fs = require('fs'),
  path = require('path'),

  esprima = require('esprima'),
  estraverse = require('estraverse'),
  
  iteratorFactory = require('../../lib/iterators'),
  getIdIterator = require('./getid'),

  FlxTriggers = require('../triggers'),

  h = require('../../lib/helpers');

var _types = {};
var flxTriggers = new FlxTriggers();


function declareFluxion(name, type) {
  return {
    type: 'Identifier',
    name: h.generateFluxionNameFromId(name),
    kind: type
  };
}

function processFluxion(context, node, type) {
  return function() {
    node.arguments.forEach(function(fluxion, i) {
      var flxDeclaration;

      switch (fluxion.type) {
        case 'FunctionExpression':
        case 'FunctionDeclaration':
          flxDeclaration = declareFluxion(fluxion.id, type);
          node.arguments[i] = flxDeclaration;
          break;
        case 'Identifier':
          var fluxionSrc = context.getHandleOnIdentifierLoc(fluxion.loc);

          if (fluxionSrc) {
            // TODO : find a way to crawl fluxionSrc with the right context and so on...
            flxDeclaration = declareFluxion(fluxionSrc.id, type);
            // console.log(flxDeclaration);
            // TODO : like that : processFluxion(context, fluxionSrc, type);
            return; // TODO : rm
          }
          else
            return;

          break;
        default:
          return;
      }

      // context.enterFlx(flxDeclaration.name, fluxion, type);
      // estraverse.traverse(fluxion, mainIterator(context));
      // context.leaveFlx();
    });
  };
}

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

      if (requireStmt.callee.name === 'require')
        flxTriggers.registerPotentialFluxionTrigger(requireStmt.arguments[0].value, n.id.name);
    }

    // TODO register initialisation as a modification.
  }
};

//   callExpression(callee, args[, loc])
_types.CallExpression = {
  enter: function (n, p, c) {
    // TODO this is bad design
    var collector = {ids: []};
    estraverse.traverse(n.callee, getIdIterator(collector));

    if (n.callee.name === 'require') {
      c.processRequire(n);
    }


    flxTriggers.fluxionTrigger(collector.ids, {
      start: processFluxion(c, n, 'start'),
      post: processFluxion(c, n, 'post')
    });
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

    if (id && !flxTriggers.isReservedIdentifier(id.name)) {
      c.registerModification(id, {
        init: init,
        fn: c.isFunction(init)
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

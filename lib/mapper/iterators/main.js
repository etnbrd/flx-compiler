var fs = require('fs'),
  path = require('path'),
  esprima = require('esprima'),
  iteratorFactory = require('../../lib/iterators'),
  estraverse = require('estraverse'),
  getIdIterator = require('./getid'),
  h = require('../../lib/helpers');

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
            console.log(flxDeclaration);
            // TODO : like that : processFluxion(context, fluxionSrc, type);
            return; // TODO : rm
          }
          else
            return;

          break;
        default:
          return;
      }

      context.enterFlx(flxDeclaration.name, fluxion, type);
      estraverse.traverse(fluxion, mainIterator(context));
      context.leaveFlx();
    });
  };
}

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
          requireStmt = n.init;

      if (requireStmt.callee.name === 'require')
        c.registerPotentialFluxionTrigger(requireStmt.arguments[0].value, n.id.name);
    }
  }
};

//   callExpression(callee, args[, loc])
_types.CallExpression = {
  enter: function (n, p, c) {
    // TODO this is bad design
    var collector = {ids: []};
    estraverse.traverse(n.callee, getIdIterator(collector));

    c.fluxionTrigger(collector.ids, {
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

    if (id.type === 'MemberExpression') {
      id = id.object;
    }

    if (id && !c.isReservedIdentifier(id.name)) {
      c.registerModification(id);
    }

    // TODO detect if a function is assigned to a variable, see context.js.
    // if (c.isFunction(n.right.type)) {
    //   c.registerFunction(id);
    // }
  }
};

var mainIterator = iteratorFactory(_types);

module.exports = mainIterator;

var fs = require('fs'),
  path = require('path'),
  esprima = require('esprima'),
  iteratorFactory = require('../lib/iterators'),
  estraverse = require('estraverse'),
  h = require('../lib/helpers');

function declareFluxion(name, type) {
  return {
    type: 'Identifier',
    name: h.generateFluxionNameFromId(name),
    kind: type
  };
}

var _types = {};

_types.FunctionDeclaration = 
_types.FunctionExpression = 
_types.CatchClause =
_types.Program = {
  enter: function (n, p, c) {

    // TODO if the function is used for more than the async call, we NEED to run the mapping concurrently for two fluxion : the old, and the new.

    if (n.rupturePoint) {
      // The identifier holding the functino we are looking for is either the name of the function declared or the name of the identifier initialized with it.
      // TODO declaration like : var name1 = name2 = function() {} will leak the function.
      var id;
      if (p.type === 'VariableDeclarator') {
        id = p.id;
      } else {
        id = n.id;
      }

      // TODO finding through the currentScope isn't enough, we need to be sure the identifier is NEVER used.

      if (id) {      
        var handler = n.rupturePoint.call.arguments[n.rupturePoint.cbIndex],
            refs = c.currentScope.references.filter(function(ref) {
              return ref.identifier.name === id.name
                  && ref.identifier !== handler;
            })

        if (refs.length > 0) {
          n.rupturePoint.cbNeeded = true;
        }
      }

      c.enterFlx(n.rupturePoint);
    }

    c.enterScope(n);
  },
  leave: function (n, p, c) {
    c.leaveScope(n);

    if (n.rupturePoint)
      c.leaveFlx();
  }
};


//   callExpression(callee, args[, loc])
_types.CallExpression = {
  enter: function (n, p, c) {

    if (n.context) {
      c.processRequire(n);
    }
  }
};

var mainIterator = iteratorFactory(_types);

module.exports = mainIterator;
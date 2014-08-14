var bld = require('./builders'),
    iteratorFactory = require('../lib/iterators');

var _types = {};

_types.Identifier = {
  leave: function(n, p, c) {

    if (n.modifier) {
      if (n.modifier.target === 'signature') {
        return bld.signatureModifier(n.name);
      }

      if (n.modifier.target === 'scope') {
        return bld.scopeModifier(n.name);
      }

      if (n.modifier.target === 'sync') {
        return bld.syncModifier(n.name);
      }
    }
  }
};

_types.CallExpression = {
  enter: function(n, p, c) {

    if (n.rupturePoint) {

      if (n.rupturePoint.type === 'start'){
        n.rupturePoint.call.arguments[n.rupturePoint.cbIndex] = bld.start(n.rupturePoint.name, n.rupturePoint.signature); // TODO signature
      }

      if (n.rupturePoint.type === 'post'){
        return bld.post(n.rupturePoint.name, c.signature, n.rupturePoint.call.arguments);
      }

    }
  }
}

_types.FunctionDeclaration =
_types.FunctionExpression = {
  enter: function(n, p, c) {
    if (n.rupturePoint && !n.rupturePoint.cbNeeded && n !== p) {
      // return {type: 'EmptyStatement'}; // TODO this is not working / incomplete, see mapper.
    }
  }
}

module.exports = iteratorFactory(_types);
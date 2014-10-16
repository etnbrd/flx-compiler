var iteratorFactory = require('../lib/iterators');

var _types = {};

_types.CallExpression = {
  enter: function(n, p, c) {

    if (n.rupturePoint) {

      if (n.rupturePoint.type === 'start'){
        n.rupturePoint.call.arguments[n.rupturePoint.cbIndex] = {type: 'Identifier', name: c.start + ' ' + n.rupturePoint.name}; // TODO signature
      }

      if (n.rupturePoint.type === 'post'){
        // TODO this is wrong, it should replace the whole asynchronous call.
        n.rupturePoint.call.arguments[n.rupturePoint.cbIndex] = {type: 'Identifier', name: c.post + ' ' + n.rupturePoint.name}; // TODO signature
        // return {type: 'Identifier', name: c.post + ' ' + n.rupturePoint.name};
      }

    }
  }
}

module.exports = iteratorFactory(_types);
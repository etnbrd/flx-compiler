var bld = require('../builders'),
    iteratorFactory = require('../../lib/iterators');

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
    }

    if (n.kind === 'start'){
      return bld.start(n.name, n.signature);
    }

    if (n.kind === 'post'){
      return bld.post(n.name, n.signature);
    }
  }
};

module.exports = iteratorFactory(_types);

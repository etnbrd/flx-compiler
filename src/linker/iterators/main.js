var bld = require('../../linker/builders'),
    iteratorFactory = require('../../lib/iterators');

var _types = {};

_types.Identifier = {
  enter: function(c, node) {
    if (node.modifier) {
      if (node.modifier.target === 'signature')
        return bld.signatureModifier(node.name);

      if (node.modifier.target === 'scope')
        return bld.scopeModifier(node.name);
    }

    if (node.kind === 'start')
      return bld.start(node.name.substring(1), node.signature);
  }
};

module.exports = iteratorFactory(_types);

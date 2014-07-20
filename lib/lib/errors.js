var pre = 'ERROR : ';
var post = '';

// TODO factory cool stuff to handle pre + post

module.exports = {
  missingType: function(node) {
    return pre + 'node ' +  node + ' has no type';
  },

  missingHandler: function(node) {
    return pre + ' handler not implemented for ' + node.type;
  },

  identifierConflict: function(ids) {
    return pre + 'conflicting identifier in ' + ids.toString();
  },

  scopeConflict: function(ids) {
    return pre + 'conflicting scope in ' + ids.toString();
  },

  flxConflict: function(name) {
    return pre + 'conflicting fluxion name : ' + name;
  },

  callExpressionExpected: function(call) {
    return pre + 'expected a CallExpression, but got ' + call.name;
  },

  multipleOccurences: function(ocs) {
    return pre + 'expected only one occurence, but got several : ' + ocs;
  }
};

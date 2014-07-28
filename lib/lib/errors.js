var pre = 'ERROR : ';
var post = '';

var errorHandlers = {};

errorHandlers.missingType = function(node) {
  return 'node ' +  node + ' has no type';
};

errorHandlers.missingHandler = function(node) {
  return ' handler not implemented for ' + node.type;
};

errorHandlers.identifierConflict = function(ids) {
  return 'conflicting identifier in ' + ids.toString();
};

errorHandlers.scopeConflict = function(ids) {
  return 'conflicting scope in ' + ids.toString();
};

errorHandlers.flxConflict = function(name) {
  return 'conflicting fluxion name : ' + name;
};

errorHandlers.callExpressionExpected = function(call) {
  return 'expected a CallExpression, but got ' + call.name;
};

errorHandlers.multipleOccurences = function(ocs) {
  return 'expected only one occurence, but got several : ' + ocs;
};

for (var k in errorHandlers) {
  if (errorHandlers.hasOwnProperty(k))
    errorHandlers[k] = function(v) {
      return pre + errorHandlers[k](v) + post;
    };
}

module.exports = errorHandlers;

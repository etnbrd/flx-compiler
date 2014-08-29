var pre = 'ERROR : ';
var post = '';

var errorHandlers = {};

errorHandlers.missingType = function(node) {
  return pre + 'node ' +  node + ' has no type' + post;
};

errorHandlers.missingHandler = function(node) {
  return pre + ' handler not implemented for ' + node.type + post;
};

errorHandlers.identifierConflict = function(ids) {
  return pre + 'conflicting identifier in ' + ids.toString() + post;
};

errorHandlers.scopeConflict = function(ids) {
  return pre + 'conflicting scope in ' + ids.toString() + post;
};

errorHandlers.flxConflict = function(name) {
  return pre + 'conflicting fluxion name : ' + name + post;
};

errorHandlers.callExpressionExpected = function(call) {
  return pre + 'expected a CallExpression, but got ' + call.name + post;
};

errorHandlers.multipleOccurences = function(ocs) {
  return pre + 'expected only one occurence, but got several : ' + ocs + post;
};

errorHandlers.missingOutput = function(name) {
  return pre + 'entering fluxion ' + name +  ' without an output' + post;
};

errorHandlers.missingDeclaration = function(name) {
  return pre + 'Identifier ' + name + ' isn\'t resolved, it is probably never declared.' + post;
};

module.exports = errorHandlers;
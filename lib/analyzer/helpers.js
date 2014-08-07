var fs = require('fs'),
    pth = require('path'),
    h = require('../lib/helpers');

function compareScopeByBlock(n) {
  return function(scope) {
    return (scope.block === n);
  };
}

function getScopeName(scope) {
  if (scope.block.id)
    return scope.block.id.name;
  if (scope.block.type === 'Program')
    return 'Program';

  return 'anonymous';
}

function populate(variable) {

  function local(scope, variable) {
    scope.references.forEach(function(reference) {
      if (reference.identifier.name === variable.name) {
        variable.references.push(reference);
        reference.resolved = variable;
      }
    });
  }

  // populate the references array of `variable` with all references from all nested child scope
  function global(scopes, variable) {
    scopes.forEach(function(scope) {
      // Break when another variable of the same name is declared
      if (scope.variables.some(function(_variable) {
            return _variable.name === variable.name;
          })) {
        return;
      }

      // Push matching references
      local(scope, variable);

      // Recurse
      global(scope.childScopes, variable);
    });
  }

  // Push local matching references
  if (variable.references.length === 0) {
    local(variable.scope, variable);
  }

  // Start scope lookup recursion
  global(variable.scope.childScopes, variable);

  return variable;
}

module.exports = {
  compareScopeByBlock: compareScopeByBlock,
  getScopeName: getScopeName,
  populate: populate
};

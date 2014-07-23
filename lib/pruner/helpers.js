function compareScopeByBlock(n) {
  return function(scope) {
    return (scope.block === n);
  };
}

function populate(variable) {
  // populate the references array of `variable` with all references from all nested child scope
  function _populate(scopes, variable) {
    scopes.forEach(function(scope) {
      // Break when another variable of the same name is declared
      if (scope.variables.some(function(_variable) {
            return _variable.name === variable.name;
          })) {
        return;
      }

      // Push matching references
      scope.references.forEach(function(reference) {
        if (reference.identifier.name === variable.name) {
          variable.references.push(reference);
        }
      });

      // Recurse
      _populate(scope.childScopes, variable);
    });
  }

  if (variable.references.length === 0) {
    // Push local matching references
    variable.scope.references.forEach(function(reference) {
      if (reference.identifier.name === variable.name) {
        variable.references.push(reference);
      }
    });
  }

  // Start scope lookup recursion
  _populate(variable.scope.childScopes, variable);

  return variable;
}

function reserved(name) {
    return !!(name === 'require' || name === 'exports' || name === 'module' || name === 'console');
}


module.exports = {
  compareScopeByBlock: compareScopeByBlock,
  populate: populate,
  reserved: reserved,
}
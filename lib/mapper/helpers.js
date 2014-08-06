var fs = require('fs'),
    pth = require('path'),
    h = require('../lib/helpers');

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

function getScopeName(scope) {
  if (scope.block.id)
    return scope.block.id.name;
  if (scope.block.type === 'Program')
    return 'Program';

  return 'anonymous';
}

function decypherPath(path, _dirname) {
  var filepath = pth.resolve(_dirname, path);

  if (fs.existsSync(filepath)) {
    if (fs.lstatSync(filepath).isDirectory() && fs.existsSync(filepath + '/index.js')) {
      filepath += '/index.js';
    }
  } else {
    if (filepath.lastIndexOf('.js') !== filepath.length - 3 && fs.existsSync(filepath + '.js')) {
      filepath += '.js';
    }
  }

  return filepath;
}

module.exports = {
  compareScopeByBlock: compareScopeByBlock,
  populate: populate,
  reserved: reserved,
  getScopeName: getScopeName,
  decypherPath: decypherPath
};

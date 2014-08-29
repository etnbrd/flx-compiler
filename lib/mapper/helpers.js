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


module.exports = {
  compareScopeByBlock: compareScopeByBlock,
  getScopeName: getScopeName
};
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
  getScopeName: getScopeName,
  decypherPath: decypherPath
};
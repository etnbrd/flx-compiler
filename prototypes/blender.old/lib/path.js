var util = require('util');

module.exports = {
  find: find
}

function _dep(tree, depId) {
  return tree.deps.filter(function(dep) {
    return dep.id === depId
  })
} 

function _node (tree, nodeId) {
  return tree.nodes.find(function(node) {
    if (node.id === nodeId)
      return true;
  })
}

function _identity (n) {
  return n;
}

function _next(tree, destId) {
  return function (dep) {
    if (dep.to === destId) {
      return [dep];
    } else {
      var node = _node(tree, dep.to);
      var deps = _dep(tree, node.id);

      if (deps.length === 0) {
        return false;
      }

      return deps
        .map(_next(tree, destId))
        .filter(_identity)
        .map(function(_dep) {
          return dep.concat ? dep.concat(_dep) : [dep].concat(_dep)
        })[0]; // /!\ don't forget the 0
    }
  }
}

function find(tree, sourceId, destId) {
  return _dep(tree, _node(tree, sourceId).id)
    .map(_next(tree, destId))
    .filter(_identity);
}
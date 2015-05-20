var util = require("util");
var h = require("./helpers");

module.exports = {
  find: find
}

function _dep(tree, depId) {
  return tree.deps.filter(h.idFinder(depId));
} 

function _node (tree, nodeId) {
  return tree.nodes.filter(h.idFinder(nodeId));
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

function find(sourceId, destId) {
  return _dep(this, _node(this, sourceId)[0].id)
    .map(_next(this, destId))
    .filter(_identity);
}
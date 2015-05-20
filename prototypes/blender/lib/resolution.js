var util = require('util');

var errors = require("./errors");
var cons = require("./constructors")
var h = require("./helpers")

var tools = require("./tools");

module.exports = start;

var _types = {};

function start(forest) {
  for (var _tree in forest) { var tree = forest[_tree];
    if (tree.name === "Program") {
      var clean = _resolve(tree, forest);
      // TODO I am not very proud of this design, need to be thought again - with more time.
      // The way tree are modified, and nodes to clean are returned isn't satisfaying.
      // Maybe it would work better with an actual memory tree, instead of this destructured crap.

      // Clean nodes
      tree.nodes = tree.nodes.filter(function(node) {
        return !clean.some(function(id) {
          return node.id === id;
        })
      })

      // Clean deps
      tree.deps = tree.deps.filter(function(dep) {
        return tree.nodes.some(function(node) {
          return dep.id === node.id || dep.to === node.to
        })
      })

      return tree;
    }
  }
}

function _resolve(tree, forest) {
  var clean = tree.deps.reduce(function(clean, dep) { var _tree = forest[dep.id];
    // If there is a scope with this id : it needs to be resolved    
    if (_tree) {
      if (!_types[dep.type])
        throw errors.missingHandler(dep);

      // Find the callExpression
      var call = tree.nodes.filter(h.idFinder(dep.to)) 
      if (call.length > 1)
        throw errors.multipleOccurences(call);
      if (call[0].kind !== "CallExpression")
        throw errors.callExpressionExpected(call);

      clean = clean.concat(_resolve(_tree, forest));
      return clean.concat(_types[dep.type](call[0], dep, tree, _tree, forest));
    }
    return clean;
  }, []);

  return clean;
}

function merge(include, tree, salt) {
  // Merge dependencies
  include.deps.forEach(function(dep) {
    var _dep = tools.clone(dep);

    if (include.nodes.filter(h.idFinder(_dep.id)).length > 0)
      _dep.id += salt;

    if (include.nodes.filter(h.idFinder(_dep.to)).length > 0)
      _dep.to += salt;

    tree.deps.push(_dep);
  });

  // Merge nodes
  include.nodes.forEach(function(node) {
    var _node = tools.clone(node);
    _node.id += salt;
    tree.nodes.push(_node);
  })
}

/******************************************************************************************
 * TYPES                                                                                  *
 ******************************************************************************************

Before
Argument
Callee

 */

_types.Before = function(callExpr, dep, tree, include, forest) {
  // TODO fix the needyness of this empty function
  return [];
}

_types.Argument = function(callExpr, dep, tree, include, forest) {
  var salt = "-" + h.extractSalt(callExpr.id);

  // Include arguments
  include.arguments.forEach(function(argument) {
    tree.deps.push(new cons.Dep(callExpr.id, argument.id + salt, "Callback"));
  })

  merge(include, tree, salt);

  return [];
}

_types.Callee = function(callExpr, dep, tree, include, forest) {
  var salt = "-" + h.extractSalt(include.id);
  var toClean = [dep.id, dep.to];

  // Find the downward dependency from the callExpression
  var callDep = tree.deps.filter(h.idFinder(callExpr.id))
  if (callDep.length > 1)
    throw errors.multipleOccurencs(callDep);
  callDep = callDep[0];

  // Link Arguments and Params
  tree.deps.forEach(function(_dep) {
    if (_dep.to === dep.to && _dep.type === "Argument") {
      _dep.to = include.arguments[_dep.index].id + salt;
      _dep.type = "Assignment";
    }
  })

  // Find bottom of include to link as a Return or a Before
  include.nodes.filter(function(_node) {
    return !include.deps.some(function(_dep) {
      return _node.id === _dep.id;
    })
  }).forEach(function(node) {
    if (node.type = "ReturnStatement") {
      callDep.id = node.id + salt;
    } else {
      tree.deps.push(new cons.Dep(node.id + salt, dep.to, "Before"));
    }
  });

  merge(include, tree, salt);

  return toClean;
}
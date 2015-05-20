module.exports = {
  breakFromId: breakFromId,
  down: extractDown,
  up: extractUp,
  upOnly: extractUpOnly
}


function breakFromId(tree, id) {
  // TODO merge with extract
  tree.deps = tree.deps.filter(function(dep) {
    if (dep.to === id && dep.type === "VariableDeclarator") {
      // clean the graph from free nodes
      // TODO there might be more than one node to clean
      tree.nodes = tree.nodes.filter(function(node) {
        return !(node.id === dep.id);
      })

      return false;
    }
    return true;
  })
}

function extractDown(tree, id) {

  var _n = {};
  var __n = {};
  var _d = {};

  var _id = "";
  var _name = "extract";

  if (id instanceof Array) {
    id.every(function(id) {
      _n[id] = {};
      _id += (_id === "") ? '' : ', ' + id;
      return true;
    })
  } else {
    _n[id] = {};
    _id = id;
  }

  // every downward deps
  tree.deps.forEach(function(dep) {
    for (var id in _n) {
      if (dep.id === id && dep.type !== "Before") {
        _n[dep.id] = {};
        _n[dep.to] = {};
        _d[dep.id + '+' + dep.to] = dep;
      }
    }
  })

  // freeze pool of reference nodes to only get 1 level up from the reference node.

  // every upward deps
  tree.deps.forEach(function(dep) {
    for (var id in _n) {
      if (dep.to === id && dep.type !== "Before") {
        __n[dep.id] = {};
        __n[dep.to] = {};
        _d[dep.id + '+' + dep.to] = dep;
      }
    }
  })

  // merge pools 
  for (var n in __n) {
    _n[n] = __n[n];
  }

  // populate nodes
  tree.nodes.every(function(node){
    for (var id in _n) {
      if (id === node.id) {
        _n[id] = node;
      }
    }
    return true;
  })


  var graph = {
    id: _id,
    name: _name,
    deps : [],
    nodes : []
  }

  for (var d in _d) {
    graph.deps.push(_d[d]);
  }
  for (var n in _n) {
    if (_n[n].id)
      graph.nodes.push(_n[n]);
  }

  return graph;

}

function extractUp(tree, id) {

  var _n = {};
  var __n = {};
  var _d = {};

  var _id = "";
  var _name = "extract";

  if (id instanceof Array) {
    id.every(function(id) {
      _n[id] = {};
      _id += (_id === "") ? '' : ', ' + id;
      return true;
    })
  } else {
    _n[id] = {};
    _id = id;
  }

  // every upwards deps
  var size = -1;
  while (size !== Object.keys(_d).length) {
    size = Object.keys(_d).length;
    tree.deps.forEach(function(dep) {
      for (var id in _n) {
        if (dep.to === id && dep.type !== "Before") {
          _n[dep.id] = {};
          _n[dep.to] = {};
          _d[dep.id + '+' + dep.to] = dep;
        }
      }
    })
  }

  // freeze pool of reference nodes to only get 1 level up from the reference node.

  // every downwards deps
  tree.deps.forEach(function(dep) {
    for (var id in _n) {
      if (dep.id === id /*&& dep.type !== "Before"*/) {
        __n[dep.id] = {};
        __n[dep.to] = {};
        _d[dep.id + '+' + dep.to] = dep;
      }
    }
  })

  // merge pools 
  for (var n in __n) {
    _n[n] = __n[n];
  }

  // populate nodes
  tree.nodes.every(function(node){
    for (var id in _n) {
      if (id === node.id) {
        _n[id] = node;
      }
    }
    return true;
  })


  var graph = {
    id: _id,
    name: _name,
    deps : [],
    nodes : []
  }

  for (var d in _d) {
    graph.deps.push(_d[d]);
  }
  for (var n in _n) {
    if (_n[n].id)
      graph.nodes.push(_n[n]);
  }

  return graph;

}

function extractUpOnly(tree, id) {

  var _n = {};
  var __n = {};
  var _d = {};

  var _id = "";
  var _name = "extract";

  if (id instanceof Array) {
    id.every(function(id) {
      _n[id] = {};
      _id += (_id === "") ? '' : ', ' + id;
      return true;
    })
  } else {
    _n[id] = {};
    _id = id;
  }

  // every upwards deps
  var size = -1;
  while (size !== Object.keys(_d).length) {
    size = Object.keys(_d).length;
    tree.deps.forEach(function(dep) {
      for (var id in _n) {
        if (dep.to === id && dep.type !== "Before") {
          _n[dep.id] = {};
          _n[dep.to] = {};
          _d[dep.id + '+' + dep.to] = dep;
        }
      }
    })
  }

  // freeze pool of reference nodes to only get 1 level up from the reference node.

  // every downwards deps
  // tree.deps.forEach(function(dep) {
  //   for (var id in _n) {
  //     if (dep.id === id /*&& dep.type !== "Before"*/) {
  //       __n[dep.id] = {};
  //       __n[dep.to] = {};
  //       _d[dep.id + '+' + dep.to] = dep;
  //     }
  //   }
  // })

  // merge pools 
  // for (var n in __n) {
  //   _n[n] = __n[n];
  // }

  // populate nodes
  tree.nodes.every(function(node){
    for (var id in _n) {
      if (id === node.id) {
        _n[id] = node;
      }
    }
    return true;
  })


  var graph = {
    id: _id,
    name: _name,
    deps : [],
    nodes : []
  }

  for (var d in _d) {
    graph.deps.push(_d[d]);
  }
  for (var n in _n) {
    if (_n[n].id)
      graph.nodes.push(_n[n]);
  }

  return graph;

}
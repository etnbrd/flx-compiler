var util = require('util');

module.exports = {
  resolve: resolve
}

// TODO Move in helpers module 

function _id(o) {
  if (typeof o === "string") 
    return o;
  else
    return o.id;
}

function _name(o) {
  if (typeof o === "string") 
    return o;
  else
    return o.name;
}


/****************************************
  CONSTRUCTORS
 ****************************************/

function _Context(name, id, _arguments) {
  return {
    name: name,
    id: id,
    arguments: _arguments,
    // this: _this,
    deps: [],
    nodes: []
  }
}

function _Node(node, name, id, kind) {
  function inspect() {
    return this.name + "(" + this.id + ")[" + this.kind + "]";
  }

  if (name.id) {
    id = name.id;
    name = name.name;
  }

  return {
    name: name,
    id: id,
    ref: node,
    kind: kind,
    inspect: inspect,
    toString: inspect
  }
}

function _Dep(id, to, type) {

  function inspect() {
    return this.id + " ⇢  " + this.to + "[" + this.type + "]";
  }

  return {
    id: id,
    to: to,
    type: type,
    toString: inspect,
    inspect: inspect
  }
}

// function _name(name) {
//   return name.slice(0, name.indexOf('_'));
// }

// function _base(name) {
//   var index = name.indexOf('+');
//   if (index > 0)
//     return name.slice(0, index);
//   return name;
// }

// function _salt(name) {
//   var index = name.indexOf('+') + 1;
//   if (index === 0)
//     return '';
//   return name.slice(index);
// }

function _clone(obj) {
  var copy = util._extend({}, obj);
  return copy;
}

function resolve(forest) {
  for (var tree in forest) {
    if (forest[tree].name === "Program") {
      return _resolve(forest[tree], forest);
    }
  }
  return false;
}

function _find(id) {
  return function(_node) {
    if (id === _node.id)
      return _node;
  }
}

function _resolve(tree, forest) {

  // console.log(forest);

  tree.deps.every(function(dep) {

    // If there is a scope with this id : it needs to be resolved
    if (forest[dep.id]) {
      // If it's an argument, then it must be a callback
      var include = _resolve(forest[dep.id], forest);

      if (dep.type === "Argument") {
        var call = tree.nodes.find(_find(dep.to)) 

        if (call.kind !== "CallExpression")
          throw "ERROR : expected a CallExpression, but got " + call.name;

        include.arguments.every(function(argument) {
          tree.deps.push(new _Dep(dep.to, argument.id, "Callback"));
          return true;
        })

        // Merge dependencies
        include.deps.every(function(dep) {
          var _dep = _clone(dep);
          // _dep.id += hash // TODO
          tree.deps.push(_dep);
          return true;
        });

        // Merge nodes
        include.nodes.every(function(node) {
          var _node = _clone(node);
          // _node.id += hash // TODO
          tree.nodes.push(_node);
          return true;
        })



      }
    }
    return true;
  })

  return tree;
}






function __resolve(tree, forest) {

  console.log(">> in ", tree.name);

  for (var i = 0; i < tree.dep.length; i++) {

    // CallExpression : if a tree exist with the name of the current dependency, thus, if it's a call expression
    // TODO multiple nested calls needs a _base something
    if (forest[tree.dep[i].id]) {
      var call = tree.dep[i].id;
      var inc = _resolve(forest[call], forest);
      var salt = _salt(call);

      // console.log(">> in ",  call, salt);

      // Link arguments
      for (var j = 0; j < tree.dep.length; j++) {
        if (tree.dep[j].to === call) {
          tree.dep[j].to = inc.arguments[tree.dep[j].index].id //+ "+" + salt;
        }
      }

      // Find end of function (return statement or lasts nodes on the dependency chains)
      var last_nodes = [];
      inc.nodes.every(function(node) {
        var present = false;
        inc.dep.every(function(dep) {
          if (node.id === dep.id) {
            present = true;
            return false;
          }
          return true;
        })
        if (!present) {
          last_nodes.push(node);
        }
        return true;
      })

      console.log("LAST NODES ", last_nodes);



      // Merge dependencies
      var _returns = 0;
      for (var k = 0; k < inc.dep.length; k++) {
        var dep = _clone(inc.dep[k]);

        // Link return statment
        // if (_name(dep.to) === "return" && _salt(dep.to) === '') {
        //   if(_returns++ > 1) {
        //     throw "ERROR multiple returns statement conflict";
        //   }
        //   tree.dep[i].name = dep.to //+ "+" + salt;
        // }

        // dep.name += "+" + salt;
        // dep.to += "+" + salt;

        tree.dep.push(dep);
      };

      // Merge nodes
      for (var k = 0; k < inc.nodes.length; k++) {
        var id = _clone(inc.nodes[k]);

        // id.id += "+" + salt;

        tree.nodes.push(id);
      };
    }
  };

  for (var i = 0; i < tree.nodes.length; i++) {
    if (forest[tree.nodes[i].id]) {
      // The decrementation cancels the index shift caused when removing the element
      tree.nodes.splice(i--, 1);
    }
  };

  return tree;
}
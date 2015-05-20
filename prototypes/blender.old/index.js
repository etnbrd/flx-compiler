var recast = require("recast");
var b = require("recast").types.builders;
var fs = require("fs");
var util = require("util");

var dep = require("./lib/dependency");
var depB = require("./lib/dependency").builders;
var depHash = require("./lib/dependency").hash;
var res = require("./lib/resolution");
var extract = require("./lib/extraction");
var red = require("./lib/reduction");

var walk = require("./lib/traverse");
var bld = require("./lib/builders");
var graphviz = require("./lib/graphviz");
var utils = require("./lib/utils");
var tools = require("./lib/tools");
var path = require("./lib/path");

var build = require("./lib/build");

var file = process.argv[2];
if (!file) {
  console.log("Please specify a filename as an argument");
  return -1;
}

var code = "" + fs.readFileSync(file);
var ast = recast.parse(code);
var flx = {};


// TODO crap, I thought find would return an array of ALL matching values, it doesn't.

if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        if (i in list) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return value;
          }
        }
      }
      return undefined;
    }
  });
}


// TODO 
/*
Il faut utiliser un graphe de dépendance pour récupérer les identifieur et descendre toute la chaine express.
require('express') -> app -> app.get -> callback -> req, res

Le res.send correspond à la fin de la chaine fluxionnel.
Le req, correspond au début de la chaine fluxionnel

En fonction du comportement de la variable globale, on découpera la chaine fluxionnel en plusieurs fluxions.
 .                   .
/!\ VARIABLE GLOBAL /!\

*/




var depTrees = dep.walk(ast);
// depTrees.inspect = graphviz.inspect; // Console.log
depTrees.toString = graphviz.depTree; // writeFile
utils.writeFile('depTrees', depTrees);
// console.log(depTrees);

var resTree = res.resolve(depTrees);
resTree.toString = graphviz.resTree;
// console.log(resTree);
utils.writeFile('resTree', resTree);

var appGetNode = resTree.nodes.find(function(node) {
  if (node.name === "app.get" && node.kind === "CallExpression")
    return node;
  return false;
})

// Find app.get route
var _dep = resTree.deps.find(function(dep) {
    return dep.to === appGetNode.id && dep.type === "Argument" && dep.index === 0;
})

var routePath = resTree.nodes.find(function(node) {
  return _dep.id === node.id
}).name;

var appGetChain = extract.down(resTree, appGetNode.id);
appGetChain.toString = graphviz.resTree;
// console.log(extracted);
utils.writeFile('appGetChain', appGetChain);

var resSendNode = resTree.nodes.find(function(node) {
  if (node.name === "res.send" && node.kind === "CallExpression")
    return node;
  return false;
})

var resSendArgDep = resTree.deps.find(function(dep) {
  if (dep.to === resSendNode.id && dep.type === "Argument")
    return dep;
  return false;
})

var resSendArgNode = resTree.nodes.find(function(node) {
  if (node.id === resSendArgDep.id)
    return node;
  return false;
})

var resSendChain = extract.up(resTree, resSendArgNode.id);
resSendChain.toString = graphviz.resTree;
// console.log(extracted);
utils.writeFile('resSendChain', resSendChain);

// TODO find all variables, among the extracted resSendChain

var varDec = resSendChain.nodes.filter(function(node) {
    return node.kind === "VariableDeclarator";
  }).reduce(function(node, _node, index, array) {
    // console.log(node, _node);
    node[_node.name] = node[_node.name] || [];
    node[_node.name][_node.version || 0] = _node;
    return node;
  }, {});

// TODO this is bullshit, we don't need to find paths, we just need the unresolved graph to detect out of scope variables.

function isGlobal(tree, node, appGetNode) { // TODO this is bad design, why can't I detect from which appGet the node is from ?
  // Among the variables used in resSendChain, find the global ones
  return !path.find(tree, node.id, appGetNode.id)
    .every(function(_path) {
      return _path.some(function(dep) {
        if (dep.type === "Before")
          return false;
      })
    })
}

for (var _var in varDec) {  
  if (isGlobal(resTree, varDec[_var][0], appGetNode)) {
    varDec[_var].isGlobal = true;
  }
}

// console.log(varDec);

var argChain = extract.upOnly(resTree, resSendArgNode.id);
argChain.toString = graphviz.resTree;
// console.log(extracted);
utils.writeFile('argChain', argChain);


var flxScp;

// extract the global variables chains
for (var __var in varDec) { var _var = varDec[__var];
  if (_var.isGlobal) {    
    // var globals = argChain.nodes.find(function(node) {
    //   return node.id === varDec
    // })

    var varChain = extract.upOnly(argChain, _var[0].id);

    // break the VariableDeclarator dependency
    argChain.deps = argChain.deps.filter(function(dep) {
      if (dep.to === _var[0].id && dep.type === "VariableDeclarator") {
        // clean the graph from free nodes
        // TODO there might be more than one node to clean
        argChain.nodes = argChain.nodes.filter(function(node) {
          return !(node.id === dep.id);
        })

        return false;
      }
      return true;
    })



    var bottomNode = varChain.nodes.find(function(node) {
      return varChain.deps.every(function(dep) {
        return dep.id !== node.id;
      })
    })

    // this is the code for the global stuff
    // TODO transform this into an object
    var _flxScp = _next(resTree, varChain, bottomNode);
    // console.log(" --- GLOBAL ---");
    // TODO generalize that

    flxScp = b.property("init", _flxScp.id, _flxScp.init);

    // console.log(recast.print(flxScp).code);
    // console.log(" --------------");

    function appendThisMemberExpression(node) {
      var meHash = depHash(node.ref);
      var thisHash = depHash(node.ref);

      return {
        id: meHash,
        nodes: [
          depB.node(undefined, "this." + node.name, meHash, "MemberExpression"),
          depB.node(undefined, "this", thisHash, "ThisExpression")
        ],
        deps: [
          depB.dep(thisHash, meHash, "object"),
          depB.dep(node.id, meHash, "property"),
        ]
      };
    }

    // console.log(argChain)

    // Transform every reference to that variable by the me(this, var)
    argChain.nodes.forEach(function(node) {
      if (node.name === _var[0].name) {

        var appendNode = appendThisMemberExpression(node);

        // If more than one occurence found, shit ...
        if (1 < argChain.deps.find(function(dep) {
            return dep.id === node.id || dep.to === node.id;
          }).length)
          throw "ERROR : too much variable found, expected only one";

        // Replace each dependency pointing to that occurence (should be only one)
        argChain.deps.forEach(function(dep) {
          if (node.id === dep.id) {
            dep.id = appendNode.id;
          }
          if (node.id === dep.to) {
            dep.to = appendNode.id;
          }
        })

        appendNode.deps.forEach(function(dep) {
          argChain.deps.push(dep);
        });

        appendNode.nodes.forEach(function(node) {
          argChain.nodes.push(node);
        });

        // TODO WTF ?!?
        // appendNode.deps.forEach(argChain.deps.push);
        // appendNode.nodes.forEach(argChain.nodes.push);
      }
    })

    utils.writeFile('argChain2', argChain);

  }
}

// Get the top node
// var topNode = argChain.nodes.find(function(node) {
//   return argChain.deps.every(function(dep) {
//     return dep.to !== node.id;
//   })
// })

// Get the bottom node
var bottomNode = argChain.nodes.find(function(node) {
  return argChain.deps.every(function(dep) {
    return dep.id !== node.id;
  })
})

// From the bottom node, we build the code up.
function _next(tree, chain, node) {

  // TODO What about building this fucking _next function so I don't have to pass these tree and chain as arguments every fucking time !

  // console.log(">> ", node, node.kind);

  this.VariableDeclarator = function(tree, chain, node) {

    var upwards = chain.deps.find(function(dep) {
      return dep.to === node.id && dep.type === "Assignment";
    })

    var varDecl = chain.deps.find(function(dep) {
      return dep.to === node.id && dep.type === "VariableDeclarator";
    })

    // TODO we might not find Assignment dependency, but there is still other dependency, like VariableDeclarator
    // but if variable is global, need to put it in a different chain of compilation.
    // We could return {global: [], local: []} and a peeler function to plug everything correctly by merging stuffs.

    if (upwards) {
      if (upwards.length > 1) {
        throw "ERROR : multiple assignement for " + node;
      }

      var up = chain.nodes.find(function(node) {
        return node.id === upwards.id;
      })

      if (up.length > 1) {
        throw "ERROR : multiple node, expected only one " + node;
      }

      var id = this.Identifier(tree, chain, node); // TODO bad design
      var ass = _next(tree, chain, up);

      return b.variableDeclarator(id, ass);
    } else if (varDecl) {

      var up = chain.nodes.find(function(node) {
        return node.id === varDecl.id;
      })

      if (up.length > 1) {
        throw "ERROR : multiple node, expected only one " + node;
      }

      var id = this.Identifier(tree, chain, node); // TODO bad design
      var ass = _next(tree, chain, up);

      return b.variableDeclarator(id, ass);
    } else {
      return this.Identifier(tree, chain, node);
    }
  }

  this.BinaryExpression = function(tree, chain, node) {

    var ops = ['left', 'right'].map(function(op) {
      // transform the op name in their respective dependencies
      return chain.deps.find(function(dep) {
        return dep.to === node.id && dep.side === op;
      })
    }).map(function(op) {
      // transform the dependencies in their respective up nodes
      return chain.nodes.find(function(node) {
        return node.id === op.id
      })
    }).map(function(op) {
      // build the nodes
      return _next(tree, chain, op);
    })

    ops.unshift(node.operator);

    return b.binaryExpression.apply(this, ops);

    // return b.binaryExpression(node.operator, ops[0], ops[1]);
  }

  this.Identifier = function(tree, chain, node) {
    return b.identifier(node.name);
  }

  this.Literal = function(tree, chain, node) {
    var lit = b.literal(node.name);
    return lit;
  }

  this.MemberExpression = function(tree, chain, node) {
    var ops = ['object', 'property'].map(function(op) {
      // transform the op name in their respective dependencies
      return chain.deps.find(function(dep) {
        return dep.to === node.id && dep.type === op;
      })
    }).map(function(op) {
      // transform the dependencies in their respective up nodes
      return chain.nodes.find(function(node) {
        return node.id === op.id
      })
    }).map(function(op) {
      // build the nodes
      return _next(tree, chain, op);
    })

    ops.push(false) // isComputed ?

    // TODO bad design, this shouldn't be here, should be gathered for every nodes.
    // Detect every upwards dependencies, then process them with the types constructor.
    var upwards = chain.deps.find(function(dep) {
      return dep.to === node.id && dep.type === "Assignment";
    })

    if (upwards) { // There is an assignement
      var _node = chain.nodes.find(function(node) {
        return node.id === upwards.id;
      })

      return b.assignmentExpression(upwards.operator, b.memberExpression.apply(this, ops), _next(tree, chain, _node) )
    } else {
      return b.memberExpression.apply(this, ops);
    }

  }

  this.ThisExpression = function(tree, chain, node) {
    return b.thisExpression();
  }

  return this[node.kind](tree, chain, node);
}


// TODO here we have only one expression, but we should expect several

flxBody = _next(resTree, argChain, bottomNode);

flx = b.expressionStatement(
    b.callExpression(
      b.memberExpression(b.identifier("flx"), b.identifier("register"), false),
      [
        b.literal(routePath),
        bld.flxSimple(flxBody),
        b.objectExpression([flxScp])
      ]
    )
  )

prg = bld.program([
    bld.requires("../../"),
    flx,
    bld.route(routePath, routePath, routePath)
  ])

// console.log(recast.print(prg).code);

utils.writeFile(file.split('.')[0] + "-flx", recast.print(prg).code, 'js');


// var _tree = tools.convert(extracted);

// function extractOutput(_tree) {
//   var _nodes = [];
//   for (var _node in _tree.nodes) { var node = _tree.nodes[_node];
//     if (node.name === "res.send" && node.kind === "CallExpression") {
//       _nodes.push(node);
//     }
//   }
//   if (_nodes.length !== 1) {
//     throw "ERROR : none, or multiple res.send nodes, expected one";
//   } else {
//     return _nodes[0];
//   }
// }
// // Extract the res.send CallExpression node
// var resSend = extractOutput(_tree);



/*

walk(ast, function(n) {


  console.log(n.callee);

  if (!n.callee || !n.type || !n.callee.object || !n.callee.property) {
    return
  }

  if (n.callee.object.name === "app"
  &&  n.callee.property.name === "get"
  &&  n.type === "CallExpression") {
    var route = "";

    n.arguments.forEach(function(arg, index) {
      if (arg.type === "Literal") {
        route = arg;
      }

      if (arg.type === "FunctionExpression") {

        var name = route || arg.id.name || "flx" + flx.length();
        while (flx[name]) {
          name += "2";
        }
        flx[name] = arg;
        n.arguments[index] = b.placeholder(name, name);
      }
    })
  }
})


console.log(" SOURCE \n");
console.log(code);
console.log("\n -------------- ");

console.log(" TARGET \n");

var _flx = [];
var _route = [];


for (var _fl in flx) { var fl = flx[_fl];

  var body = fl.body.body;
  var output = "fluxion " + _fl + " >> " + "output\n" +
  body.reduce(function(output, line) {
    return output + "  " + recast.print(line).code.replace(/\n/g, '\n  ') + "\n";
  }, "")

  _flx.push(output);
  _route.push("web.route " + _fl + ", " + _fl );
}

console.log(_flx.join("\n"));
console.log(_route.join("\n"));

console.log(recast.print(ast).code);

*/
var util = require("util");
var recast = require("recast");
var graphviz = require("./lib/graphviz");
var utils = require("./lib/utils");
var dep = require("./lib/dependency");
var res = require("./lib/resolution");
var red = require("./lib/reduction");
var build = require("./lib/build");
var extract = require("./lib/extraction");
var walk = require("./lib/traverse");
var tools = require("./lib/tools");

var builders = require('./lib/builders');

var b = recast.types.builders;

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

// Let's turn this function declaration into a variable declaration.
// var code = [
//   // "var e = 1;",
//   // "var f = 2;",
//   "function sub(a, b) {",
//   "  return a - b;",
//   "}",
//   "function add(a, b) {",
//   "  return sub(a, 5) + sub(b, 1);",
//   "}",
//   // "var c = add(4, 5);",
//   "var d = add(3, 9);"
// ].join("\n");

var code = [
  "var app = require('express')();",
  // "var count = {};",
  "app.get(\"/:id\", function reply(req, res){",
  "  res.send(\"reply\");",
  "});",
  "app.listen(8080);"
].join("\n");

// var app = require('express')();
// app.get(":id", function reply(req, res){
//   res.send("reply");
// });
// app.listen(8080);

// var code = [
//   // "var app = require('express')();",
//   "var count = {};",
//   "app.get(\"/:id\", function reply(req, res){",
//   "  count[req.params.id] = count[req.params.id] + 1  || 1;",
//   "  var visits = count[req.params.id];",
//   "  var reply = req.params.id + '[' + visits + ']';",
//   "  res.send(reply);",
//   "});",
//   // "app.listen(8080);"
// ].join("\n");

// Parse the code using an interface similar to require("esprima").parse.
var ast = recast.parse(code);

/* DISPLAY AST */
// var _ast = recast.parse(code)
// walk(_ast, function(o) {
// 	o.loc = undefined;
// })
// console.log(JSON.stringify(_ast, undefined, 2));
// utils.writeFile("ast", JSON.stringify(_ast, undefined, 20), "json");

/* DISPLAY CODE */
// var output = recast.print(ast).code;
// console.log(output);
// console.log(" ------------------- ");

// Extract routes
// ast.program.body.some(function(o) {
//   console.log(o);
// })


var depTrees = dep.walk(ast);
// depTrees.inspect = graphviz.inspect; // Console.log
depTrees.toString = graphviz.depTree; // writeFile
utils.writeFile('depTrees', depTrees);
// console.log(depTrees);


var resTree = res.resolve(depTrees);
resTree.toString = graphviz.resTree;
// console.log(resTree);
utils.writeFile('resTree', resTree);

// TODO select all Callback downwards dependencies from app.get nodes.
var extracted = extract(resTree, "2042-1007");// ["231134-1013", "236239-1015"]);
extracted.toString = graphviz.resTree;
// console.log(extracted);
utils.writeFile('extract', extracted);

var _tree = tools.convert(extracted);

// console.log(_tree);

// TODO to get res.send, we need the app.get node, and so we need the reference app, and so we need to get the require('express')
// In this extract, we want to select the res.send CallExpression node, and extract all the chain up from the argument.
function extractOutput(_tree) {
  var _nodes = [];
  for (var _node in _tree.nodes) { var node = _tree.nodes[_node];
    if (node.name === "res.send" && node.kind === "CallExpression") {
      _nodes.push(node);
    }
  }
  if (_nodes.length !== 1) {
    throw "ERROR : none, or multiple res.send nodes, expected one";
  } else {
    return _nodes[0];
  }
}
// Extract the res.send CallExpression node
var resSend = extractOutput(_tree);

// Get the argument
var reply = _tree.tos[resSend.id].find(function(dep) {
  if (dep.type === "Argument") {
    return dep.id;
  }
}).id

// Extract the app.get path argument
// TODO generalize an extractor with on object of condition to meet
function extractGet(_tree) {
  var _nodes = [];
  for (var _node in _tree.nodes) { var node = _tree.nodes[_node];
    if (node.name === "app.get" && node.kind === "CallExpression") {
      _nodes.push(node);
    }
  }
  if (_nodes.length !== 1) {
    throw "ERROR : none, or multiple res.send nodes, expected one";
  } else {
    return _nodes[0];
  }
}
// Extract the app.get CallExpression node
var appGet = extractGet(_tree);

var path = _tree.tos[appGet.id].find(function(dep) {
  if (dep.index === 0) {
    return dep
  }
}).id;

// Get the first argument : the path
// var reply = _tree.tos[resSend.id].find(function(dep) {
//   if (dep.type === "Argument") {
//     return dep.id;
//   }
// }).id

// TODO we need more extract function, to extract only the upward dependencies, downwards dependencies etc ...
// var replyChain = extract(extracted, reply.id);
// console.log(replyChain);

// TODO from reply, we should extract the chain, and then make fluxions out of it.
// but as for the moment, there is no chain, but a single fluxion, I will do this part later, and go on with code generation
// console.log(reply.ref);

/* TODO get route path */
var flx = builders.program([
  builders.requires("../../lib/"),
  builders.register(reply.ref.value, builders.HelloWorld(reply.ref)),
  builders.route(path.ref.value, reply.ref.value, reply.ref.value)
])

// console.log(flx);

console.log(recast.print(flx).code);



// ast.program.body[0] = b.variableDeclaration("var", [
//     b.variableDeclarator(add.id, b.functionExpression(
//         null, // Anonymize the function expression.
//         add.params,
//         add.body
//     ))
// ]);


// var redTree = red.reduce(resTree);
// redTree.toString = graphviz.redTree;
// utils.writeFile("redTree", redTree);
// console.log(redTree);

// var output = build(redTree);
// // console.log(output);
// utils.writeFile("output", output, "js");




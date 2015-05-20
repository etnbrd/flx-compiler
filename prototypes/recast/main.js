var recast = require("recast");
var util = require("util");
var fs = require("fs");

// Let's turn this function declaration into a variable declaration.
var code = [
  "function add(a, b) {",
  "  return a + b;",
  "}",
  "var c = add(4, 5);"
].join("\n");

var id = {};
var fn = {};
var types = {};
var graphParts = [];

function toGraphviz() {
  var _output = [
    'digraph G {\n',
    '  graph [ fontname="HelveticaNeue-Thin", fontcolor=black, fontsize=20 ];',
    '  node [ fontname="HelveticaNeue-Thin", fontcolor=black, fontsize=20, penwidth=0.5 shape=circle, fixedsize=true, width=1.2, height=1.2 ];',
    '  edge [ fontname="HelveticaNeue-Thin", fontcolor=black, fontsize=20, penwidth=0.5 splines=line, arrowsize=0.7 ];\n\n'
  ].join("\n");


  _output += '  plus [label="+"]\n';

  var _nodes = "";

  for (var i = 0; i < this.length; i++) {
    var _name = (this[i].name === "+") ? 'plus' : this[i].name;
    var _to = (this[i].to === "+") ? 'plus' : this[i].to;

    if (_name[1] == ',') {
      _output += '  ' + _name.replace(',', '') + ' [label="' + _name + '"] ';
      _name = _name.replace(',', '');
    }
    if (_to[1] == ',') {
      _output += '  ' + _to.replace(',', '') + ' [label="' + _to + '"] ';
      _to = _to.replace(',', '');
    }

    _nodes += "  " + _name + " -> " + _to + ';\n';
  };

  return _output + "\n\n" + _nodes + "}\n";
}

// graphParts.inspect = toGraphviz; // override to get same output on file and console
graphParts.toString = toGraphviz; // toString used by writeFile, inspect used by console

function oups() {
  return console.error("Unknown graph topology");
}

function writeFile(name, data) {
  var path = name + ".dot"

  process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m ' + path);
  fs.writeFileSync(path, data);
  console.log('  \x1B[1m\x1B[32m✓\x1B[39m\x1B[22m');
}

function Node(name) {

  function inspect() {
    return this.name + " ⇢  " + this.to;
  }

  return {
    name: name,
    toString: inspect,
    inspect: inspect
  }
}

function walk(o, cb) {

  function _walk_o (o) {
    // console.log(">> walking object");
    for (var i in o) {
      _walk(o[i]);
    }
  }

  function _walk_a (a) {
    // console.log(">> walking array");
    for (var i = 0; i < a.length; i++) {
      _walk(a[i]);
    };
  }
  
  function _walk(o) {
    if (!o)
      return;

    cb(o);

    // Array
    if (o.length && typeof o !== "string") {
      _walk_a(o);
    }
    // Object
    else if (o.toString() === "[object Object]") {
      _walk_o(o);
    } else {
      // console.log("---");
    }
  }

  return _walk(o);
}

// Parse the code using an interface similar to require("esprima").parse.
var ast = recast.parse(code);

// Remove code location to lighten ast
walk(ast, function(o) {
  o.loc = undefined;
})

// console.log(JSON.stringify(ast, undefined, 2));


var output = recast.print(ast).code;

console.log(output);
console.log(" ------------------- ");


function walkGraph(ast) {
  walk(ast, function(o) {

    if(o.type) {
      types[o.type] = {};

      if (o.type === "Identifier")
        id[o.name] = {};

      if (o.type === "FunctionExpression" || o.type === "FunctionDeclaration") {
        fn[o.id.name] = {
          params: {}
        }; // TODO composition pattern
        for (var i = 0; i < o.params.length; i++) {
          fn[o.id.name].params[o.params[i].name] = {};
        };
      }
    }

    // GRAPH PARTS

    if (o.type === "VariableDeclaration") {
      for (var i = 0; i < o.declarations.length; i++) { var decl = o.declarations[i];
        var node = new Node(decl.init.callee.name) // TODO if (CallExpression), return getId(callee) // With getId a generic visitor

        if (decl.type === "VariableDeclarator") {
          node.to = decl.id.name; // TODO getId(decl)
        } else {
          oups();
        }

        graphParts.push(node);
      };
    }


    if (o.type === "CallExpression") {
      for (var i = 0; i < o.arguments.length; i++) {
        var node = new Node(o.arguments[i].value)
        node.to = o.callee.name
        graphParts.push(node);
      };
    }

    // TODO we need a way to know the path in the AST

    if (o.type === "ReturnStatement") {
      if (o.argument.type === "BinaryExpression" ) {
        for (var i in {'left':'', 'right':''}) {
          var node = new Node(o.argument[i].name);
          node.to = o.argument.operator;
          node.context = "add"; // TODO this is pure bullshit, needs the path
          graphParts.push(node);
        }

        var node = new Node(o.argument.operator);
        node.to = "return";
        node.context = "add"; // TODO this is pure bullshit, needs the path
        graphParts.push(node);
      }
    }
  });
}

function resolution(graphParts) {

  var _contexts = {};

  for (var i = 0; i < graphParts.length; i++) {
    if (graphParts[i].context) {
      _contexts[graphParts[i].context] = _contexts[graphParts[i].context] || [];
      _contexts[graphParts[i].context].push(graphParts[i]);
    }
  };

  for (var _name in _contexts) {
    // Looking for patterns like : 4 ⇢ add, (add) a ⇢ +
    // Something like 4 ⇢ add would be replaced by : 4 ⇢ a
    var _args = [];
    var _params = [];
    var _c = _contexts[_name];

    console.log(">> context", _c);

    for (var arg in fn[_name].params) {
      _args.push(arg);
    };

    // Here : 4 ⇢ add, 5 ⇢ add
    for (var index = 0; index < graphParts.length; index++) { var _part = graphParts[index] ;
      if (_part.to === _name) {
        _params.push(_part);
      }
    }

    if (_args.length === _params.length) for (var i = 0; i < _args.length; i++) {
      _params[i].to = _args[i];
    } else {
      console.error("Error : in context " + _name + " not matching argument and params size")
    }

    // Here + ⇢ return, add ⇢ c
    for (var index = 0; index < graphParts.length; index++) { var _part = graphParts[index] ;
      if (_part.name === _name) {
        _part.name = 'return';
      }
    }

  };
}

function reduction(graphParts) {

  // Detect if a node has multiple dependencies
  var _branches = [];
  var _dirty = false;
  do {
    _dirty = false;
    for (var i = 0; i < graphParts.length; i++) {
      for (var j = 0; j < graphParts.length; j++) {
        if (i !== j && graphParts[i].to === graphParts[j].to) { // TODO what if there is more than two upcoming dependencies ?
          _dirty = true;
          graphParts[i].names = [graphParts[i].name, graphParts[j].name];
          graphParts[i].name = graphParts[i].name + ',' + graphParts[j].name;
          graphParts.splice(j, 1);

          for (var k = 0; k < graphParts.length; k++) {
            for (var m = 0; m < graphParts[i].names.length; m++) { var name = graphParts[i].names[m];
              if (name === graphParts[k].to) {
                console.log(name + " === " + graphParts[k].to)
                graphParts[k].index = m;
                graphParts[k].to = graphParts[i].name;
              }
            };
          };
        }
      };
    };
  } while(!_dirty)
}

function build(graphParts) {

  var _code = "";

  // console.log(graphParts);

  for (var i = 0; i < graphParts.length; i++) {
    graphParts[i]
    var _output = [
      "flx.register('" + graphParts[i].name + "', function(msg) {",
      "// here, code generation",
      "return m('" + graphParts[i].to + "', msg);",
      "})"
    ].join("\n");

    console.log(_output + "\n\n");
  };
}

// console.log("Identifiers : ", id);
// console.log("Functions : ", fn);
// console.log("Types : ", types);

walkGraph(ast);
writeFile('graphWal', graphParts);
console.log(graphParts);

resolution(graphParts);
writeFile('graphRes', graphParts);
console.log(graphParts);

reduction(graphParts);
writeFile('graphRed', graphParts);
console.log(graphParts);

build(graphParts);

// writeFile("graph", graphParts);





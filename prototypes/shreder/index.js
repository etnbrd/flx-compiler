var recast = require("recast");
var fs = require("fs");
var util = require("util");

var b = require("./lib/builders");
var walk = require("./lib/traverse");
var t = require("./lib/tools");

var transform = require("./lib/transform");

var graphviz = require("./lib/graphviz");

var filename = process.argv[2];
if (!filename) {
  console.log("Please specify a filename as an argument");
  return 0;
}

// TODO 
// - generate graphs from fluxions
// - Be able to break avery program (no dependencies, just expose rupture points out of async fn)


// AST
var ast = recast.parse(fs.readFileSync(filename).toString());

// console.log(util.inspect(ast, false, 1000));

var ctx = transform(ast);

console.log("\n ============================================= ")

function print(ast) {
  var pre = "  ";
  return pre + recast.print(ast).code.replace(/\n/g, "\n" + pre)
}

// // SOURCE CODE DISPLAY
// for (var _flx in ctx._flx) { var flx = ctx._flx[_flx];
//  console.log("\n" + flx.name + " >> " + ((flx.outputs.length) ? flx.outputs.map(function(o) {return o.name + " [" + Object.keys(o.signature) + "]"}).join(", ") : "ø") );

//  flx.parents.forEach(function(parent) {
//    // console.log(parent);
//    if (parent.output.dest === flx)
//      console.log(Object.keys(parent.output.signature));
//  })

//  console.log(print(flx.ast));
// }

// GRAPHVIZ DISPLAY
var _graph = {
  nodes: [],
  edges: [],
  name: filename
}

function toName(id) {
  return id.split('-')[0];
}

for (var _flx in ctx._flx) { var flx = ctx._flx[_flx];

  _graph.nodes.push({
    name: toName(flx.name),
    id: flx.name
  })

  if (flx.outputs && flx.outputs.length > 0) flx.outputs.map(function(o) {
    _graph.edges.push({
      id: flx.name,
      to: o.name,
      signature: o.signature
    })
  })
}

var basename = filename.split('/');
basename = basename[basename.length-1];

var graph = graphviz.toString.call(_graph);
t.writeFile(basename.replace(".js", ".dot"), graph, "./graphs/");


// function displayCtx(ctx) {

//   console.log("\n== Scopes ==");

//   ctx._scopes.forEach(function(scope) {
//     console.log("  " + scope.name + "[" + (scope.parent ? scope.parent.name : "ø") + "]" + " // " + scope.flx.name);
//   })

//   console.log("== Fluxions ==");

//   for (var _flx in ctx._flx) { var flx = ctx._flx[_flx];
//     console.log("\n" + flx.name + " >> " + ((flx.outputs.length) ? flx.outputs.map(function(o) {return o.name + " [" + Object.keys(o.signature) + "]"}).join(", ") : "ø") );

//     flx.parents.forEach(function(parent) {
//       // console.log(parent);
//       if (parent.output.dest === flx)
//         console.log(Object.keys(parent.output.signature));
//     })

//     console.log(print(flx.ast));
//   }
// }

// displayCtx(ctx);


function link(ctx) {
  var code = print(ctx._flx.Main.ast);

  for (var _flx in ctx._flx) { var flx = ctx._flx[_flx];
    if (flx.name !== "Main") {

      var _code = print(b.register(flx.name, flx.ast));

      code += "\n\n// " + flx.name + " >> " + ((flx.outputs.length) ? flx.outputs.map(function(o) {return o.name + " [" + Object.keys(o.signature) + "]"}).join(", ") : "ø") + "\n\n" + _code;
    }
  }

  return code;
}

var result = link(ctx);

t.writeFile(basename, result, "./results/");
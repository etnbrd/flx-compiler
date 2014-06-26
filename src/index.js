var fs = require("fs");
var util = require("util");

var t = require("./lib/tools");

var graphviz = require("./lib/graphviz");

// var compile = require("./compile");
var parse = require("recast").parse;
var transform = require("./lib/transform");
var link = require("./lib/link");
var print = require("recast").print;

var filename = process.argv[2];
if (!filename) {
  console.log("Please specify a filename as an argument");
  return 0;
}

var basename = filename.split('/');
basename = basename[basename.length-1];

// TODO 
// - generate graphs from fluxions
// - Be able to break avery program (no dependencies, just expose rupture points out of async fn)

// Enable logs;
process.env.verbose = true;

var ast = parse(fs.readFileSync(filename).toString());
var ctx = transform(ast);
var res = link(ctx);

t.writeFile(basename, res, "./results/");

var graph = graphviz.ctxToGraph(ctx, filename);

t.writeFile(basename.replace(".js", ".dot"), graph, "./graphs/");

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

//     console.log(print(flx.ast).code);
//   }
// }

// displayCtx(ctx);
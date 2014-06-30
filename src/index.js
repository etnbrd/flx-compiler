var fs = require("fs");
var util = require("util");

var t = require("./lib/tools");

var graphviz = require("./lib/graphviz");

// var compile = require("./compile");
var parse = require("recast").parse;
var transform = require("./lib/transform");
var link = require("./lib/link");
var print = require("recast").print;

var printer = require("./lib/printer");

var filename = process.argv[2];
if (!filename) {
  console.log("Please specify a filename as an argument");
  return 0;
}

var basename = filename.split('/');
basename = basename[basename.length-1];

// TODO 
// - generate graphs from fluxions
// - Be able to break every program (no dependencies, just expose rupture points out of async fn)

// Enable logs;
// process.env.verbose = true;

var ast = parse(fs.readFileSync(filename).toString());
var ctx = transform(ast);
var res = link(ctx);
var graph = graphviz.ctxToGraph(ctx, filename);


process.env.verbose = true;
t.writeFile(basename, res, "./results/");
t.writeFile(basename.replace(".js", ".dot"), graph, "./graphs/");

console.log();
console.log(printer(ctx));
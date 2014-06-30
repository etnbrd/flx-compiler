var fs = require("fs");
var util = require("util");

var t = require("./lib/tools");

var graphviz = require("./lib/graphviz");

// var compile = require("./compile");
var parse = require("recast").parse;
var prune = require("./pruner");
var link = require("./linker");
var printer = require("./printer");

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
// - Be able to break every program (no dependencies, just expose rupture points out of async fn)

// Enable logs;
// process.env.verbose = true;

var ast = parse(fs.readFileSync(filename).toString());
var ctx = prune(ast);
var res = link(ctx);

// console.log(util.inspect(ast, false, 100));

var graph = graphviz.ctxToGraph(ctx, filename);


process.env.verbose = true;
t.writeFile(basename, res, "./results/");
t.writeFile(basename.replace(".js", ".dot"), graph, "./graphs/");

console.log();
console.log(printer(ctx));
console.log("\n\n === \n\n");
console.log(res);
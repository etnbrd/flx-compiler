var fs = require("fs");
var util = require("util");

var t = require("./lib/tools");

var graphviz = require("./lib/graphviz"); // TODO replace graphviz by d3.js, or sigma.js

var parse = require("recast").parse;
var prune = require("./pruner");
var link = require("./linker");
var printer = require("./printer");

var print = require("recast").print;

var i = require("./lib/interface");

// var options = i.args(process.argv);

// if (options.verbose) {
//   process.env.verbose = true;
// }

// if (!options.intput) {
//   console.log("Please specify a filename as an argument");
//   return 0;
// }

i.pipe(function run(input) {
  var ast = parse(input);
  var ctx = prune(ast);
  var res = link(ctx);

  // console.log();
  // console.log(printer(ctx));
  // console.log("\n\n === \n\n");
  // console.log(res);

  return res;
})
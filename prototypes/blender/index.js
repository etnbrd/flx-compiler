var recast = require("recast");
var fs = require("fs");
var util = require("util");

var tools = require("./lib/tools");

var dep = require("./lib/dependency");
var res = require("./lib/resolution");
var ext = require("./lib/extraction");



var filename = process.argv[2];
if (!filename) {
  console.log("Please specify a filename as an argument");
  return 0;
}

// AST
var ast = recast.parse(fs.readFileSync(filename).toString());

// DEP
var depTree = dep(ast);
tools.writeFile("depTree.dot", depTree, "./graph/");

// RES
var resTree = res(depTree);
tools.writeFile("resTree.dot", resTree, "./graph/");

// EXT
var flxChains = ext(resTree);
tools.writeFile('flxChains.dot', flxChains, "./graph/");



// TODOs /////////////////////////////////////////////////////////////////////
/*****************************************************************************

- During the resolution, some nodes aren't properly cleaned
- During the resolution, the Before edges shouldn't be removed, they should be linked
- During the extraction, shit happend when detecting if a variable is global, might be related to precedent point, or might not be.

******************************************************************************/
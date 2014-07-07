/*
   This file is a sandbox.
   Do whatever you want to do, comment the rest.
   */

var recast = require("recast");
var fs = require("fs");
var util = require("util");

module.exports = {
    truc : "truc"
};

var test = require("./test");



console.log(test);

// var map =  require('./lib/traverse').map;
// var red =  require('./lib/traverse').reduce;

// var ast = recast.parse(fs.readFileSync("sample.js").toString());

// console.log(util.inspect(ast, false, 1000));

// var end = red(ast.program, {
//  enter: function(n) {
//      return n.type + ":[";
//  },
//  leave: function(n, prev) {
//      return "]";
//  },
//  aggregate: function(prev, n) {
//      console.log("= % ", n)

//      if (n !== false)
//          return prev + ',' + n;
//      else
//          return prev;
//  },
//  init: ""
// })

// console.log(" --- ");

// console.log(end);



// code = "" +
// "flx.register(name, function capsule(msg) {\n" +
// "  // merge scope (this) and signature (msg._sign)\n" +
// "  (function reply(req, res) {\n" +
// "    res.send(\"42\");\n" +
// "  })(msg._args);\n" +
// "})\n"


// console.log(util.inspect(recast.parse(code), false, 100));

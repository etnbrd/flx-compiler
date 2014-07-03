// <<<<<<< HEAD
var iterator = require("../lib/traverse").iterator(require('./iterators/main'))
,   cons = require("./constructors")
,   map = require("../lib/traverse").map
,   red = require("../lib/traverse").reduce
;
// =======
// var recast = require("recast")
// ,   fs = require("fs")
// ,   util = require("util")
// ,   cons = require("./constructors")
// ,   errors = require("../lib/errors")
// ,   h = require("../lib/helpers")
// ,   map = require("../lib/traverse").map
// ,   red = require("../lib/traverse").reduce
// ,   commonMapper = require('../lib/tools').commonMapper
// ;

// // var bld = require("./builders");
// >>>>>>> 22c62ac25d925df398b4bce5ba34dd75189fc530

module.exports = start;

function start(ast) {
  var context = new cons.Context(ast);
  context.enterFlx("Main", ast.program);


  // console.log(">>> ITERATOR \n", iterator.toString());

  map(ast.program, iterator(context));
  // commonMapper(ast.program, context);
  context.leaveFlx();
  return context;
}
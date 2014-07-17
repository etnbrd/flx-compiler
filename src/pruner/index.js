var iterator = require("./iterators/main")
// iterator = require("../lib/traverse").iterator(require("./iterators/main"))
,   cons = require("./constructors")
// ,   map = require("../lib/traverse").map
,   estraverse = require("estraverse")
,   escope = require("escope")
,   util = require("util")
,   log = require("../lib/log")
;


function start(ast, filename) {
  log.start("PRUNER");
  var context = new cons.Context(ast, filename);
  estraverse.traverse(ast, iterator(context));
  context.end();
  return context;
}

module.exports = start;
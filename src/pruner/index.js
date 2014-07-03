var iterator = require("./iterators").main;
var cons = require("./constructors");
var map = require("../lib/traverse").map;
var red = require("../lib/traverse").reduce;

module.exports = start;

function start(ast) {
  var context = new cons.Context(ast);
  context.enterFlx("Main", ast.program);
  map(ast.program, iterator(context));
  context.leaveFlx();
  return context;
}
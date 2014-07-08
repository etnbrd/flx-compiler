var iterator = require("../lib/traverse").iterator(require('./iterators/main')),
    cons = require("./constructors"),
    map = require("../lib/traverse").map,
    red = require("../lib/traverse").reduce;

function start(ast) {
    var context = new cons.Context(ast);
    context.enterFlx("Main", ast.program);
    map(ast.program, iterator(context));
    context.leaveFlx();
    return context;
}

module.exports = start;

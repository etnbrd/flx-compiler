var iterator = require("./iterators/main")
// iterator = require("../lib/traverse").iterator(require("./iterators/main"))
,   cons = require("./constructors")
// ,   map = require("../lib/traverse").map
,   estraverse = require("estraverse")
,   escope = require("escope")
,   util = require("util")
;


function start(ast) {

    // var scopes = escope.analyze(ast);
    // console.log(util.inspect(scopes, false, 10));

    var context = new cons.Context(ast);
    context.enterFlx("Main", ast);
    // map(ast.program, iterator(context));

    estraverse.traverse(ast, iterator(context));

    context.leaveFlx();
    return context;
}

module.exports = start;
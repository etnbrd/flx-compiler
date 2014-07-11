var iterator = require("./iterators/main")
// iterator = require("../lib/traverse").iterator(require("./iterators/main"))
,   cons = require("./constructors")
// ,   map = require("../lib/traverse").map
,   estraverse = require("estraverse")
,   escope = require("escope")
,   util = require("util")
;


function start(ast) {

    var scopes = escope.analyze(ast);
    var str = util.inspect(scopes, false, 1000);
    // var str = JSON.stringify(scopes);

    // require("fs").writeFileSync("scopes.json", str);

    var context = new cons.Context(ast, scopes);
    context.enterFlx("Main", ast);
    // map(ast.program, iterator(context));

    estraverse.traverse(ast, iterator(context));

    context.leaveFlx();
    return context;
}

module.exports = start;
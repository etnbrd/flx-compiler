var iterator = require('./iterators/main'),
    Context = require('./context'),
    estraverse = require('estraverse'),
    escope = require('escope'),
    log = require("../lib/log");


module.exports = function(ast, filename) {
    log.start("MAPPER");
    var context = new Context(ast, filename);
    estraverse.traverse(ast, iterator(context));
    context.end();
    return context;
};

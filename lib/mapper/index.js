var iterator = require('./iterators/main'),
    requiresIterator = require('./iterators/require'),
    Context = require('./context'),
    estraverse = require('estraverse'),
    escope = require('escope'),
    log = require("../lib/log");


module.exports = function(ast, filename, dirname) {
    log.start("MAPPER");
    estraverse.traverse(ast, requiresIterator());
    var context = new Context(ast, filename, dirname);
    estraverse.traverse(ast, iterator(context));
    context.end();
    return context;
};

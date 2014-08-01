var iterator = require('./iterators/main'),
    Context = require('./context'),
    estraverse = require('estraverse'),
    escope = require('escope'),
    log = require("../lib/log");


module.exports = function(ast, filename, dirname) {
    log.start("MAPPER");
    var context = new Context(ast, filename, dirname);
    estraverse.traverse(ast, iterator(context));
    context.end();
    return context;
};

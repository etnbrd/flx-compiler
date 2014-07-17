var iterator = require('./iterators/main'),
    constructors = require('./constructors'),
    estraverse = require('estraverse'),
    escope = require('escope'),
    log = require("../lib/log");


module.exports = function(ast, filename) {
    log.start("PRUNER");
    var context = new constructors.Context(ast, filename);
    estraverse.traverse(ast, iterator(context));
    context.end();
    return context;
};

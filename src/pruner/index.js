var iterator = require('./iterators/main'),
    constructors = require('./constructors'),
    estraverse = require('estraverse'),
    escope = require('escope');


module.exports = function(ast) {
    var scopes = escope.analyze(ast);

    var context = new constructors.Context(ast, scopes);
    context.enterFlx('Main', ast);

    estraverse.traverse(ast, iterator(context));

    context.leaveFlx();
    return context;
};


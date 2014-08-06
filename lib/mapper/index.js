var iterator = require('./iterators/main'),
    
    analyze = require('./iterators/analyze'),
    AnalyzeCtx = require('.analyzeCtx'),
    
    map = require('./iterators/map'),
    MapCtx = require('.mapCtx'),
    
    requiresIterator = require('./iterators/require'),
    Context = require('./context'),
    
    estraverse = require('estraverse'),
    escope = require('escope');


module.exports = function(ast, filename, dirname, root) {
    // estraverse.traverse(ast, requiresIterator());
    // var context = new Context(ast, filename, dirname, root);

    estraverse.traverse(ast, analyze(new AnalyzeCtx(ast, filename, dirname, root)));
    // estraverse.traverse(ast, map(context));

    // estraverse.traverse(ast, iterator(context));
    // context.end();
    return context;
};
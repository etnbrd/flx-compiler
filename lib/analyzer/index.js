var analyze = require('./iterator'),
    AnalyzeContext = require('./context'),

    estraverse = require('estraverse');

module.exports = function(ast, filename, dirname, root) {

    estraverse.traverse(ast, {
      enter: function(n, p) {
        if (n.parent) {
          console.log('WARNING !!!', n);
        }

        n.parent = p;
      }
    })

    var ctx = new AnalyzeContext(ast, filename, dirname, root);
    estraverse.traverse(ast, analyze(ctx));

    return ctx;
};
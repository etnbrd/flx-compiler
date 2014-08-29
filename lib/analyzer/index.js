var analyze = require('./iterator'),
    AnalyzeContext = require('./context'),
    estraverse = require('estraverse');

module.exports = function(ast, filename, dirname, root) {

  var ctx = new AnalyzeContext(ast, filename, dirname, root);
  estraverse.traverse(ast, analyze(ctx));

  return ctx;
};
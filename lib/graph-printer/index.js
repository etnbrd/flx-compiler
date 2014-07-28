module.exports = function(ctx) {



  var scp =ctx.scopes.map(function(scope) {

    console.log(scope.type);

    if (scope.block.type === 'Program')
      return 'Program';

    if (scope.block.type === 'FunctionExpression')
      return scope.block.id.name;
  });



  console.log(scp);





  var str = require('util').inspect(ctx);

  require('fs').writeFileSync('lib/graph-printer/ctx.json', str);

}
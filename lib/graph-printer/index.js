var d3 = require('d3'),
    graph = require('./graph');

 d3.layout.squarepack = require('./pack-layout.js');

module.exports = function(ctx) {

      graph(ctx);
      return d3.select('svg').html();













  // var scp = ctx.scopes.map(function(scope) {

  //   console.log(scope.type);

  //   if (scope.block.type === 'Program')
  //     return 'Program';

  //   if (scope.block.type === 'FunctionExpression')
  //     return scope.block.id.name;
  // });



  // console.log(scp);





  // var str = require('util').inspect(ctx);

  // require('fs').writeFileSync('lib/graph-printer/ctx.json', str);

}
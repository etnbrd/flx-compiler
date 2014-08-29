var estraverse = require('estraverse'),
    parse = require('esprima').parse;


module.exports = function(code) {

  // Esprima doesn't like the #! in the beginning of node script files, so we remove the first line.
  if (code[0] === '#') {
    code = code.slice(code.indexOf('\n'));
  }

  ast = parse(code, {loc: true});


  // We build the parenting backlink needed for the next steps in the compilation.
  estraverse.traverse(ast, {
    enter: function(n, p) {
      if (n.parent) {
        console.log('WARNING !!!', n);
      }

      n.parent = p;
    }
  })

  return ast;
}
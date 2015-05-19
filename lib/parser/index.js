var estraverse = require('estraverse'),
    parse = require('esprima').parse,
    fs = require('fs'),
    pth = require('path');


module.exports = function(code, filename, dirname) {

  // Esprima doesn't like the #! in the beginning of node script files, so we remove the first line.
  if (code[0] === '#') {
    code = code.slice(code.indexOf('\n'));
  }

  var ast = parse(code, {loc: true});

  // We build the parenting backlink needed for the next steps in the compilation.
  estraverse.traverse(ast, {
    enter: function(n, p) {
      if (n.parent) {
        // console.log('WARNING !!!', n);
      }

      n.parent = p;

      if (n.type === 'CallExpression'
      &&  n.callee.type === 'Identifier'
      &&  n.callee.name === 'require'
      &&  n.arguments[0].type === 'Literal'
      &&  n.arguments[0].value.substring(0,1) === '.' ) {

        // console.log(">>>             REQUIRE");

        monkeyInsert(n, dirname);
      }
    }
  })

  // var gen = require('escodegen');

  // console.log(ast);

  // console.log('>>> ' + gen.generate(ast));

  return ast;
}

function monkeyInsert(n, dirname) {

  var filename = n.arguments[0].value;
  var path = decypherPath(filename, dirname); // TODO this.dirname doesn't exist

  if (fs.existsSync(path)) {

    var file = fs.readFileSync(path);

    // console.log(n, file);

    // console.log("recurse in required file");

    var metaParse = require('./');

    var includeAST = metaParse(file, filename, dirname);
    // includeAST.type = 'BlockStatement';

    includeAST.body.push({
      type: 'ReturnStatement',
      argument: {
        type: 'Identifier',
        name: 'module.exports'
      }
    })

    // var IIFE = {
    //   type: 'FunctionExpression',
    //   id: null,
    //   params: [],
    //   defaults: [],
    //   rest: null,
    //   body: {type: 'BlockStatement', body: []},//includeAST.body},
    //   generator: false,
    //   expression: true
    // }

    var IIFE = parse('(function (){})();').body[0].expression.callee;

    IIFE.body.body = includeAST.body;

    // console.log(require('util').inspect(parse('(function (){})();'), false, 5));


    // console.log(require('util').inspect(IIFE, false, 5));


    var gen = require('escodegen');


    // console.log(includeAST);

    // console.log('>>> ' + gen.generate(IIFE));

    // throw 'clean bandit';      

    n.callee = IIFE;

    /*
     * TODO, here I'm super lazy.
     * The best solution is to build a complete module loading solution with a cache of previously loaded modules.
     * It is needed for stateful modules that are instantiated multiple times.
     * But I went for the easier solution.
     */

  }
};


function decypherPath(path, _dirname) {

  var filepath = pth.resolve(_dirname, path);

  if (fs.existsSync(filepath)) {
    if (fs.lstatSync(filepath).isDirectory() && fs.existsSync(filepath + '/index.js')) {
      filepath += '/index.js';
    }
  } else {
    if (filepath.lastIndexOf('.js') !== filepath.length - 3 && fs.existsSync(filepath + '.js')) {
      filepath += '.js';
    }
  }

  return filepath;
}
var escodegen = require('escodegen'),
    iterator = require('./iterator'),
    estraverse = require('estraverse');

const options = {
  format: {
    indent: {
      style: '  ',
      base: 0,
      adjustMultilineComment: false
    },
    newline: '\n',
    space: ' ',
    json: false,
    renumber: false,
    hexadecimal: false,
    quotes: 'single',
    escapeless: true,
    compact: false,
    parentheses: true,
    semicolons: true,
    safeConcatenation: false
  },
  moz: {
    starlessGenerator: false,
    parenthesizedComprehensionBlock: false,
    comprehensionExpressionStartsWithAssignment: false
  },
  parse: null,
  comment: false,
  sourceMap: undefined,
  sourceMapRoot: null,
  sourceMapWithCode: false,
  // sourceContent: originalSource, // TODO
  directive: false,
  verbatim: undefined
};

const start = '>>';
const post = '->';
const Flx = 'fluxion';
const indent = '  ';

const sep = ', ';

const ctxls = '[';
const ctxrs = ']';
const signls = '(';
const signrs = ')'

const arrow = {
  start: start,
  post: post,
  undefined: post
};

function declaration(d) {
  return Flx  + ' ' + d.name.replace(/-/g, '_').replace(/\./g, '_'); // TODO fix flx names
}

function context(f) {
  return ctxls + (Object.keys(f.scope) || []).join(sep) + ctxrs;
}

function signature(flx) {
  return signls + Object.keys(flx.signature).join(', ') + signrs;
}

function stream(n) {
  return arrow[n.rupturePoint.type] + ' ' + n.rupturePoint.name.replace(/-/g, '_').replace(/\./g, '_') + ' ' + signature(n.scopes[0].flx);
}

function code(ast) {

  require('estraverse').replace(ast, {
    enter: function(n) {
      if (n.rupturePoint
       && (n.type === 'FunctionExpression'
       ||  n.type === 'FunctionDeclaration')) {
        return {
          type: 'Identifier',
          name: stream(n)
        }
      }
    }
  })

  return '{\n  ' + escodegen.generate(ast, options).replace(/\n/g, '\n' + indent) + '\n}';
}

function flx(f) {
  var res = declaration(f) + ' ' + context(f) + ' ' + code(f.ast);
  return res;

  // console.log('\n' + flx.name + ' >> ' + ((flx.outputs.length) ? flx.outputs.map(function(o) {return o.name + ' [' + Object.keys(o.signature) + ']'}).join(', ') : 'ø') );

  // flx.parents.forEach(function(parent) {
  //   // console.log(parent);
  //   if (parent.output.dest === flx)
  //     console.log(Object.keys(parent.output.signature));
  // })
}

function printer(ctx) {
  return Object.keys(ctx.flx).reverse().map(function(flxName) {
    return flx(ctx.flx[flxName]);
  }).join('\n\n');
}

module.exports = printer;

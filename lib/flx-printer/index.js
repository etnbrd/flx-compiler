var escodegen = require('escodegen');

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

const start = '↠'; // fallback '>>'
const post = '→'; // fallback '->'
const empty = 'ø'; // fallback '#'
const Flx = 'flx';
const indent = '  ';

const sep = ', ';
const ls = '[';
const rs = ']';

const arrow = {
  start: start,
  post: post,
  undefined: post
};

function code(ast) {
  return indent + escodegen.generate(ast, options).replace(/\n/g, '\n' + indent);
}

function declaration(d) {
  return Flx  + ' ' + d.name + '\n';
}

function signature(s) {
  return ls + Object.keys(s).join(sep) + rs;
}

function output(o) {
  return arrow[o.type] + ' ' + o.name + ' ' + signature(o.signature) +  '\n';
}

function flx(f) {
  var res = declaration(f);

  if (f.outputs.length > 0) {
    res += f.outputs.map(output).join('');
  } else {
    res += arrow[f.type] + ' ' + empty + '\n';
  }

  res += code(f.ast);

  return res;

  // console.log('\n' + flx.name + ' >> ' + ((flx.outputs.length) ? flx.outputs.map(function(o) {return o.name + ' [' + Object.keys(o.signature) + ']'}).join(', ') : 'ø') );

  // flx.parents.forEach(function(parent) {
  //   // console.log(parent);
  //   if (parent.output.dest === flx)
  //     console.log(Object.keys(parent.output.signature));
  // })
}

function printer(ctx) {
  return Object.keys(ctx.flx).map(function(flxName) {
    return flx(ctx.flx[flxName]);
  }).join('\n\n');
}

module.exports = printer;

var print = require('recast').print;

module.exports = printer

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
}

function code(ast) {
  return indent + print(ast).code.replace(/\n/g, "\n" + indent);
}

function declaration(d) {
  return Flx  + " " + d.name + "\n";
}

function output(o) {
  return arrow[o.type] + " " + o.name + " " + signature(o.signature) +  "\n";
}

function signature(s) {
  return ls + Object.keys(s).join(', ') + rs;
}

function flx(f) {
  var res = declaration(f);

  if (f.outputs.length > 0) {
    res += f.outputs.map(output);
  } else {
    res += arrow[f.type] + " " + empty + "\n";
  }

  res += code(f.ast);

  return res;

  // console.log("\n" + flx.name + " >> " + ((flx.outputs.length) ? flx.outputs.map(function(o) {return o.name + " [" + Object.keys(o.signature) + "]"}).join(", ") : "ø") );

  // flx.parents.forEach(function(parent) {
  //   // console.log(parent);
  //   if (parent.output.dest === flx)
  //     console.log(Object.keys(parent.output.signature));
  // })
}

function printer(ast) {
  return Object.keys(ast._flx).map(function(flxName) {
    return flx(ast._flx[flxName]);
  }).join('\n\n');
}
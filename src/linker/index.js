var escodegen = require("escodegen")
,   bld = require("./builders")
//,    map = require("../lib/traverse").map
,   iterator = require("./iterators/main")
,   estraverse = require("estraverse")
,   util = require("util")
;


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
}

function print(ast) {
  return escodegen.generate(ast, options);
}

function printFlx(flx) { // TODO this belongs in the flx printer
  if (flx.outputs.length) {
    return flx.outputs.map(function (o) {
      return o.name + " [" + Object.keys(o.signature) + "]";
    }).join(", ");
  }
  else {
    return "ø";
  }
}

function bySource (source) {
  return function (reference) {
    return (reference.from.flx !== source)
  }
}

function modifier(type) {
  return function (reference) {
    reference.identifier.modifier = {
      target: type
    }

    // console.log(">>> ", reference.identifier.name, reference.identifier.loc.start);
  }
}

function link(ctx) {
  var code = ""
  ,   flx
  ,   _flx
  ,   _ast
  ,   card
  ,   mcard
  ,   _mod
  ,   dep
  ;

  for (_flx in ctx.flx) {
    flx = ctx.flx[_flx];

    console.log("in " + flx.name);
    for (_mod in flx.dependencies) { dep = flx.dependencies[_mod];

      card = Object.keys(dep.variable.flxs).length;
      mcard = Object.keys(dep.variable.modifierFlxs).length;

      // CORE DEPENDENCIES RESOLVER // TODO might be better suited in the constructor.

      // TODO debug function

      console.log("  " + dep.variable.name + " is used in " + card + " flx, and modified in " + mcard + " flx");
      console.log("    + used in : " + Object.keys(dep.variable.flxs).join(', '));
      console.log("    + modified in : " + Object.keys(dep.variable.modifierFlxs).join(', '));

      // 2 fluxions, none modify the variable : Problem #3
      if ((card === 2 && mcard === 0)
      // 2 fluxions, the non root fluxion modify the variable : Problem #4
      ||  (card === 2 && mcard === 1 && !dep.variable.modifierFlxs[dep.source.name])) {
        console.log("      -> therfore, it's in the scope");
        dep.references.filter(bySource(dep.source))
                      .forEach(modifier("scope"));

        flx.scope[dep.variable.name] = dep;
      } else {
        console.log("      -> therfore, it's in the signature");
        dep.references.filter(bySource(dep.source))
                      .forEach(modifier("signature"));
        flx.signature[dep.variable.name] = dep;
      }
    }

    _ast = estraverse.replace(flx.ast, iterator(flx));

    if (flx.root) {
      // Add the flx library
      _ast.body.unshift(bld.requireflx());

      code = print(_ast) + code;
    } else {

      _ast = bld.register(flx.name, _ast, flx.scope);

      // This is only the comment :
      code += "\n\n// " + flx.name + " >> " + printFlx(flx) + "\n\n" + print(_ast);
    }
  }

  return code;
}

module.exports = link;
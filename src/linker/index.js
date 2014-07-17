var escodegen = require("escodegen")
,   bld = require("./builders")
//,    map = require("../lib/traverse").map
,   iterator = require("./iterators/main")
,   estraverse = require("estraverse")
,   util = require("util")
,   log = require('../lib/log')
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

function debug(dep, type) {

  log.info( "" +
    log.blue(dep.variable.name) + log.grey(" [") + log.bold(type) + log.grey("] ") +
    Object.keys(dep.variable.flxs).reduce(function(prev, name) {
      var _name = name;

      if (dep.source.name === name) {
        _name += log.blue("$");
      }

      if (dep.variable.modifierFlxs[name]) {
        _name += log.yellow("⚡");
      }

      prev.push(_name);
      return prev;
    }, []).join(', ')
  );

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

  log.start("LINKER");

  for (_flx in ctx.flx) {
    flx = ctx.flx[_flx];


    // console.log("in " + flx.name);
    log.in(flx.name);
    for (_mod in flx.dependencies) { dep = flx.dependencies[_mod];

      card = Object.keys(dep.variable.flxs).length;
      mcard = Object.keys(dep.variable.modifierFlxs).length;

      // CORE DEPENDENCIES RESOLVER // TODO might be better suited in the constructor.

      // 2 fluxions, none modify the variable : Problem #3
      if ((card === 2 && mcard === 0)
      // 2 fluxions, the non root fluxion modify the variable : Problem #4
      ||  (card === 2 && mcard === 1 && !dep.variable.modifierFlxs[dep.source.name])) {
        debug(dep, "scope");
        dep.references.filter(bySource(dep.source))
                      .forEach(modifier("scope"));

        flx.scope[dep.variable.name] = dep;
      }

      // else {
      //   log.info("  in " + log.bold("signature"));
      //   dep.references.filter(bySource(dep.source))
      //                 .forEach(modifier("signature"));
      //   flx.signature[dep.variable.name] = dep;
      // }
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

    log.out();
  }

  return code;
}

module.exports = link;
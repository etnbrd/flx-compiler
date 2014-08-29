// # Fluxionnal compiler

// **Developers shouldn't bother about scalability.
// This compiler enable scalability for any Javascript web application.**

// ---

// The audience’s growth a web application needs to adapt to, often leads its development team to quickly adopt disruptive and continuity-threatening shifts of technology.
// To avoid these shifts, we propose an approach that abstracts web applications into an high-level language, which authorizes code mobility to cope with audience dynamic growth and decrease.

// We think a web application can be depicted as a network of small autonomous parts moving from one machine to another and communicating by message streams.
// We named these parts fluxions, by contraction between a stream and a function.
// Fluxions are executed by the [Fluxionnal execution model](../flx-lib), distributed over a network of machines according to their interdependencies to minimize overall data transfers.

// **This compiler extract fluxions and their streams from a Javascript web application, to run them in a distributed fashion.**

'use strict';

// ## Compiler components

// + Esprima is a Javascript parser, generating an Abstract Syntax Tree specified by the [Mozilla Parser API]()
var parse = require('./parser'),

// + **Analyzer** detects rupture points
    analyze = require('./analyzer'),
// + [**Mapper**](context) break program along the AST, and map them to the original program.
    map = require('./mapper'),
// + [**Linker**](core) resolves dependencies between fluxions.
    link = require('./linker'),
// + Printers transform the abstract representation of the fluxionnal program, back into code compatible with the [fluxionnal execution model](../flx-lib), into fluxionnal code, or into representation graph.
    jsPrinter = require('./js-printer'),
    flxPrinter = require('./flx-printer'),
    graphPrinter = require('./graph-printer'),
    graphInspectorPrinter = require('./graph-inspector-printer'),
    log = require("./lib/log");

function _compile(code, filename, dirname) {
  var ast, ctx;

  log.start('PARSER');
  ast = parse(code);

  log.start('ANALYZER');
  ctx = analyze(ast, filename, dirname);

  log.start('MAPPER');
  ctx = map(ctx);

  log.start('LINKER');
  ctx = link(ctx);

  return {
    ctx: ctx,

    toJs: function () {
      return jsPrinter(ctx);
    },

    toFlx: function () {
      return flxPrinter(ctx);
    },

    toGraph: function() {
      return graphPrinter(ctx);
    },

    toGraphInspector: function(code) {
      return graphInspectorPrinter(ctx, code);
    }
  };
}

module.exports = _compile;

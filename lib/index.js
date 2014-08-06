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
var parse = require('esprima').parse,

// + [**Pruner**](context) detects fluxions, and map them to the original program.
    map = require('./mapper'),
// + [**Linker**](core) resolves dependencies between fluxions.
    link = require('./linker'),
// + Printers transform the abstract representation of the fluxionnal program, back into code compatible with the [fluxionnal execution model](../flx-lib), into fluxionnal code, or into representation graph.
    jsPrinter = require('./js-printer'),
    flxPrinter = require('./flx-printer'),
    graphPrinter = require('./graph-printer'),
    log = require("./lib/log");

function _compile(code, filename, dirname) {

  code = '' + code;

  if (code[0] === '#') { // Esprima doesn't like the #!
    code = code.slice(code.indexOf('\n'));
  }

  var ast = parse(code, {loc: true});
  log.start('MAPPER');
  var pre = map(ast, filename, dirname);
  log.start('LINKER');
  var ctx = link(pre);

  return {
    toJs: function () {
      return jsPrinter(ctx);
    },

    toFlx: function () {
      return flxPrinter(ctx);
    },

    toGraph: function() {
      return graphPrinter(ctx);
    }    
  }
}

module.exports = _compile;
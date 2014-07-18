'use strict';

var parse = require('esprima').parse,
    prune = require('./pruner'),
    link = require('./linker'),
    jsPrinter = require('./js-printer'),
    flxPrinter = require('./flx-printer');
//     graphicPrinter = require('./graphic-printer'); // TODO

function _compile(code, filename) {
  var ctx = link(prune(parse(code, {loc: true}), filename));

  return {
    toJs: function () {
      return jsPrinter(ctx);
    },

    toFlx: function () {
      return flxPrinter(ctx);
    }
  }
}

module.exports = _compile;
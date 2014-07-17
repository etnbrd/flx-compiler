'use strict';

var parse = require('esprima').parse,
    prune = require('./pruner'),
    link = require('./linker'),
    jsPrinter = require('./js-printer'),
    flxPrinter = require('./flx-printer');
//     graphicPrinter = require('./graphic-printer'); // TODO

function _compile(code, filename) {
  return link(prune(parse(code, {loc: true}), filename));
}

module.exports = {
  toJs: function (ctx) {
    return jsPrinter(_compile(ctx));
  },

  toFlx: function (ctx) {
    return flxPrinter(_compile(ctx));
  }
}
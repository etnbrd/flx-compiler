'use strict';

var log = require('../lib/log'),
    core = require('./core'),
    typeWalkers = require('./iterators/main');

module.exports = function(ctx) {
  var flx,
      _flx,
      _mod,
      dep;

  for (_flx in ctx.flx) {
    flx = ctx.flx[_flx];

    log.in(flx.name);


    for (_mod in flx.dependencies) {
      dep = flx.dependencies[_mod];

      // TODO with the dep source and target, we need to find the rupturePoint(s)

      typeWalkers[core(dep, flx)](dep, flx);
    }
    log.out();
  }

  return ctx;
}

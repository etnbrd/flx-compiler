var util = require("util"),
    log = require('../lib/log');

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
  }
}

function link(ctx) {
  var flx,
      _flx,
      _ast,
      card,
      mcard,
      _mod,
      dep;

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
    log.out();
  }

  return ctx;
}

module.exports = link;

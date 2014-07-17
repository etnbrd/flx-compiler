var util = require("util"),
    log = require('../lib/log'),
    core = require('./core');

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

_types = {} // TODO rename _types to a better suited name 

_types.scope = function (dep, flx) {
  debug(dep, "scope");
  dep.references.filter(bySource(dep.source))
                .forEach(modifier("scope"));

  flx.scope[dep.variable.name] = dep;
}

_types.signature = function (dep, flx) {
  log.info("  in " + log.bold("signature"));
  dep.references.filter(bySource(dep.source))
                .forEach(modifier("signature"));
  flx.signature[dep.variable.name] = dep;
  // TODO there is some inconsistency with outputs.
  // flx has scope, outputs has signature.
}

_types.default = function() {

  // Default behavior

}

function link(ctx) {
  var flx,
      _flx,
      dep;

  log.start("LINKER");

  for (_flx in ctx.flx) {
    flx = ctx.flx[_flx];

    log.in(flx.name);
    for (_mod in flx.dependencies) {
      dep = flx.dependencies[_mod];
      _types[core(dep)](dep, flx);
    }
    log.out();
  }

  return ctx;
}

module.exports = link;

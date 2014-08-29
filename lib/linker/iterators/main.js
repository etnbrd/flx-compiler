var log = require('../../lib/log');

function debug(dep, type) {
  log.info( '' +
    log.blue(dep.variable.name) + log.grey(' [') + log.bold(type) + log.grey('] ') +
    Object.keys(dep.variable.flxs).reduce(function(prev, name) {
      var _name = name;

      if (dep.source.name === name) {
        _name += log.blue('$');
      }

      if (dep.variable.modifierFlxs[name]) {
        _name += log.yellow('⚡');
      }

      prev.push(_name);
      return prev;
    }, []).join(', ')
  );
}

function bySource (source) {
  return function (reference) {
    return (reference.from.flx === source);
  };
}

function modifier(type) {
  return function (reference) {
    reference.identifier.modifier = {
      target: type
    };
  };
}

function metaType(type) {
  return function (dep, flx) {
    debug(dep, type);
    dep.references.filter(bySource(flx))
                  .forEach(modifier(type));

    // TODO add the dep to the rupture point, not the flx.

    flx[type][dep.variable.name] = dep;
  };
}

module.exports = {
  signature: metaType('signature'),
  scope: metaType('scope'),
  sync: metaType('sync'),
  default: function(dep, flx) {
    // Default behavior
    debug(dep, 'default');
  }
};

function isSourcePristine(dep) {
  return !dep.variable.modifierFlxs[dep.source.name];
}

function inSource(dep, flx) {
  return dep.source === flx;
}

module.exports = {
  isSourcePristine: isSourcePristine,
  inSource: inSource
}
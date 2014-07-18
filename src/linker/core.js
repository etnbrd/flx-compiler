module.exports = detectDependency

      // CORE DEPENDENCIES RESOLVER // TODO might be better suited in the constructor.


function isSourcePristine(dep) {
  return !dep.variable.modifierFlxs[dep.source.name];
}

function inSource(dep, flx) {
  return dep.source === flx;
}

function detectDependency(dep, flx) {

  card = Object.keys(dep.variable.flxs).length;
  mcard = Object.keys(dep.variable.modifierFlxs).length;

  // 2 fluxions, none modify the variable : Problem #3
  if ((card === 2 && mcard === 0 && !inSource(dep, flx))
  // 2 fluxions, the non root fluxion modify the variable : Problem #4
  ||  (card === 2 && mcard === 1 && isSourcePristine(dep) && !inSource(dep, flx))) {
    return "scope";
  }


  if ((card > 2 && isSourcePristine(dep) && !inSource(dep, flx))) {
    return "sync";
  }
 
  if ((card > 2 && isSourcePristine(dep) && inSource(dep, flx))) {
    return "signature";
  }

 return "default"; 
}
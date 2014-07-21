module.exports = detectDependency

      // CORE DEPENDENCIES RESOLVER // TODO might be better suited in the constructor.


function isSourcePristine(dep) {
  return !dep.variable.modifierFlxs[dep.source.name];
}

function inSource(dep, flx) {
  return dep.source === flx;
}

function detectDependency(dep, flx) {

  var card = Object.keys(dep.variable.flxs).length,
      mcard = Object.keys(dep.variable.modifierFlxs).length;

  // console.log(dep.variable.name, mcard, );

  // 2 fluxions, none modify the variable : Problem #3
  if ((mcard === 0 && !inSource(dep, flx))
  // 2 fluxions, the root fluxion doesn't modify the variable : Problem #4
  ||  (mcard === 1 && isSourcePristine(dep) && !inSource(dep, flx))) {
    return "scope";
  }

  // more than 2 fluxions, the non root fluxion doesn't modify the variable
  if ((mcard >= 2 && isSourcePristine(dep) && !inSource(dep, flx))) {
    return "sync";
  }
 
  // if ((card > 2 && isSourcePristine(dep) && inSource(dep, flx))) {
  //   return "signature";
  // }

 return "default"; 
}
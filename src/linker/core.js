module.exports = detectDependency

      // CORE DEPENDENCIES RESOLVER // TODO might be better suited in the constructor.



function detectDependency(dep) {

  card = Object.keys(dep.variable.flxs).length;
  mcard = Object.keys(dep.variable.modifierFlxs).length;

      

  // 2 fluxions, none modify the variable : Problem #3
  if ((card === 2 && mcard === 0)
  // 2 fluxions, the non root fluxion modify the variable : Problem #4
  ||  (card === 2 && mcard === 1 && !dep.variable.modifierFlxs[dep.source.name])) {
    return "scope";
  }

 
 return "default"; 
}


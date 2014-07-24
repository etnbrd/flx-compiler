// # Core dependency resolver

var h = require('./helpers');

// Javascript is function scoped. Each function enclose a new scope to declare variable in.
// A function scope is linked to the scope of its parent : the function inside which the child function is declared.
// The child function can access variables in the scope of all its parent, back to the global common scope.
// Function scopes are nested like russian dolls.

// Fluxion scopes, on the other hands, are not nested like functions.
// By design, fluxions can't share variables implicitly like functions.
// Instead they exchange data by streams.
// There is upstream and downstream fluxions.

// A fluxion encapsulate multiple function scope, breaking the original chain of parenting.
// This rupture leaves some functions without access to needed variables.
// The function `detectDependency` specify how to resolve the dependencies.

// There is three way to resolve dependencies :
// 
// + **signature**
//   The variable is in the signature of the fluxions.
//   The upstream fluxion will make sure this variable is sent in the stream.
// + **scope**
//   The variable is in the scope of one fluxion.
//   This fluxion can persist modification of this variable, exactly like if it was in a parent scope, or a closure.
// + **sync**
//   The variable is in the scope of several fluxions.
//   These fluxions send updates to the others each time the variable is modified.

function detectDependency(dep, flx) {

  var sharing = Object.keys(dep.variable.flxs).length,
      modifiers = Object.keys(dep.variable.modifierFlxs).length;

  // ### Scope
  // + 2 fluxions, none modify the variable : Problem #3
  if ((modifiers === 0 && !h.inSource(dep, flx))
  // + 2 fluxions, the root fluxion doesn't modify the variable : Problem #4
  ||  (modifiers === 1 && h.isSourcePristine(dep) && !h.inSource(dep, flx))) {
    return "scope";
  }

  // ### Sync
  // + more than 2 fluxions, the root fluxion doesn't modify the variable : Problem #5
  if ((modifiers >= 2 && h.isSourcePristine(dep) && !h.inSource(dep, flx))) {
    return "sync";
  }

  /*
  if ((sharing > 2 && h.isSourcePristine(dep) && h.inSource(dep, flx))) {
    return "signature";
  }
  */

 return "default"; 
}

module.exports = detectDependency
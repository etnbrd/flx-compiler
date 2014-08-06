function TriggersDict() {
  this.startTriggers = [];
  // this.startTriggers = ['app']; // TODO I am cheating here : var ex = require('express'); var app = ex() is not recognized as a fluxionTrigger.
  this.postTriggers = [];
}

// TODO FluxionTrigger should go into a separate module with everything related to this, it will grow.
TriggersDict.prototype.registerPotentialFluxionTrigger = function(requiredModule, variableName) {
  if (['express'].indexOf(requiredModule) > -1)
    return this.startTriggers.push(variableName);
  if (['fs'].indexOf(requiredModule) > -1)
    return this.postTriggers.push(variableName);
};

// TODO FluxionTrigger should go into a separate module with everything related to this, it will grow.
TriggersDict.prototype.fluxionTrigger = function(ids, triggers) {
  var expressRoutes = ['get', 'post', 'delete', 'update', 'all']

  // console.log(ids, expressRoutes.indexOf(ids[1]));

  // console.log("$$$ $ $ $ $$  start", ids, ids.length, this.startTriggers.indexOf(ids[0]));
  if (ids.length === 2 && this.startTriggers.indexOf(ids[0]) > -1 && expressRoutes.indexOf(ids[1]) > -1) {
    return triggers.start();
  }

  if (ids.length > 1 && this.postTriggers.indexOf(ids[0]) > -1) {
    return triggers.post();
  }

  return undefined; // default
};

// TODO this should go into the dictionnary (with flxTrigger and so on)
TriggersDict.prototype.isReservedIdentifier = function(name) {
  return ['require', 'exports', 'module', 'console'].indexOf(name) > -1;
};

module.exports = TriggersDict;
//  TODO this
// var dict = {

//   start:
//     'post'

//   post: 
//     'fs'
// }

var expressRoutes = [
    'get',
    'post',
    'delete',
    'update',
    'all'
  ],
    reserved = [
    'require',
    'exports',
    'module',
    'console'
  ];


function TriggersDict() {
  this.startTriggers = [];
  // this.startTriggers = ['app']; // TODO I am cheating here : var ex = require('express'); var app = ex() is not recognized as a fluxionTrigger.
  this.postTriggers = [];
}

TriggersDict.prototype.registerTrigger = function(requiredModule, variableName) {
  if (['express'].indexOf(requiredModule) > -1)
    return this.startTriggers.push(variableName);
  if (['fs'].indexOf(requiredModule) > -1)
    return this.postTriggers.push(variableName);
};

TriggersDict.prototype.typeOf = function(ids) {

  if (ids.length === 2 && this.startTriggers.indexOf(ids[0]) > -1 && expressRoutes.indexOf(ids[1]) > -1) {
    return 'start';
  }

  if (ids.length > 1 && this.postTriggers.indexOf(ids[0]) > -1) {
    return 'post';
  }

  return undefined; // default
};

TriggersDict.prototype.isReservedIdentifier = function(name) {
  return reserved.indexOf(name) > -1;
};

module.exports = TriggersDict;
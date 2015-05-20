//  TODO this
// var dict = {

//   start:
//     'post'

//   post: 
//     'fs'
// }

var log = require('../lib/log');

var expressRoutes = [
    'get',
    'post',
    'delete',
    'update',
    'all'
  ],
  fsMethods = [
    'read',
    'writeFile',
    'unlink',

    'sendFile' // It is not an fsMethod, but, well, I don't have the time to redesign triggers now.
  ]
    reserved = [
    'require',
    'exports',
    'module',
    'console'
  ];


// config.validateUser
// createSession
// db.destroy
// db.get
// db.insert
// db.view
// getUserName
// lookupUser
// req.session.destroy

function TriggersDict() {
  // this.startTriggers = [];
  // this.startTriggers = ['app', 'db']; // TODO I am cheating here : var ex = require('express'); var app = ex() is not recognized as a fluxionTrigger.
  // this.postTriggers = [];


  // TODO to test applications, I build myself the triggers for each application

  // gifSocketServer
  // this.startTriggers = ['getRawBody', 'app'];
  // this.postTriggers = [];

  // redis_key_overview
  this.startTriggers = ['exec', 'fs', 'res']
  this.postTriggers = []

}

TriggersDict.prototype.registerTrigger = function(requiredModule, variableName) {
  if (['express'].indexOf(requiredModule) > -1) {
    log.warn('[prevented] registering ' + variableName + ' as start triggers');
    return // this.startTriggers.push(variableName);
  }

  if (['fs'].indexOf(requiredModule) > -1) {
    log.warn('[prevented] registering ' + variableName + ' as post triggers');
    return // this.postTriggers.push(variableName);
  }
};

TriggersDict.prototype.typeOf = function(ids) {

  /* TODO heavy redesign needed here
   * Triggers won't do the job.
   * the start / post difference comes from the routes, or the method, not the trigger.
   */

  if (ids.length === 2 &&
  (    this.startTriggers.indexOf(ids[0]) > -1 && expressRoutes.indexOf(ids[1]) > -1
    || this.startTriggers.indexOf(ids[0]) > -1 && fsMethods.indexOf(ids[1]) > -1)
  ||  ids.length === 1 &&
  (    this.startTriggers.indexOf(ids[0]) > -1)) {
   // TODO this is kind of bruteforce -> if the startTriggers is express, then use expressRoutes, if it is fs, then use fsMethods
    return 'start';
  }

  if (ids.length === 2 &&
  (    this.postTriggers.indexOf(ids[0]) > -1 && expressRoutes.indexOf(ids[1]) > -1
    || this.postTriggers.indexOf(ids[0]) > -1 && fsMethods.indexOf(ids[1]) > -1)
  ||  ids.length === 1 &&
  (    this.postTriggers.indexOf(ids[0]) > -1)) {
    return 'post';
  }

  return undefined; // default
};

TriggersDict.prototype.isReservedIdentifier = function(name) {
  return reserved.indexOf(name) > -1;
};

module.exports = TriggersDict;
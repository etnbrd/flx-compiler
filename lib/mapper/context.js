// # Fluxion mapper

// The compiler start by parsing the source to generate an Intermediate Representation (IR).
// It uses the [esprima parser](http://esprima.org/), which generates an Abstract Syntax Tree (AST) according to the [SpiderMonkey Parser API](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API).

// The compiler then generate a scope description object from the AST, using [escope](https://github.com/Constellation/escope)


// The pruner iterate over the AST to detect rupture points.
// From a rupture point, a new fluxion is created containing the asynchronous execution.

// Each fluxion contains one or multiple function scopes.
// The pruner map each function scope to the corresponding fluxion.
// The linker uses this map to resolve variable dependencies.

'use strict';

var fs = require('fs'),
    pth = require('path'),
    escope = require('escope'),

    Fluxion = require('./fluxion.js'),

    errors = require('../lib/errors'),
    log = require('../lib/log'),
    h = require('./helpers');

// ## Context

// The context holds everything needed during the compilation :

function Context (ctx) {
  var currentFlx;

  // from AnalyzeCtx
  this.name = ctx.name;
  this.dirname = ctx.dirname;
  this.ast = ctx.ast;
  this.scopes = ctx.scopes;
  this._scopeStack = ctx._scopeStack;
  this.requires = ctx.requires;
  this.root = ctx.root;
  this.rupturePoints = ctx.rupturePoints;
  this.flxTriggers = ctx.flxTriggers;


  if (ctx.root) {
    currentFlx = ctx.root.currentFlx;
  } else {
    currentFlx = new Fluxion (this.name, this.ast, true);
    currentFlx.enter();
  }

  // + Every fluxion
  this.flx = {};

  // + Pointers to useful pieces of the context to use during the parse.
  this.currentFlx = currentFlx;
  this.currentScope = undefined;
  this._flxStack = [currentFlx];
}

Context.prototype.enterScope = function (n) {
  n.scopes = this.scopes.filter(h.compareScopeByBlock(n));
  n.scopes.forEach(function(scope) {
    scope.flx = this.currentFlx;
    this._scopeStack.push(scope);
    this.currentScope = scope;

    log.enter('Enter scope ' + h.getScopeName(scope));
  }.bind(this));

  // console.log(this);

  this.currentFlx.registerScopes(n.scopes);
  return n.scopes;
};

Context.prototype.leaveScope = function(n) {
  n.scopes.forEach(function(scope) {
    scope = this._scopeStack.pop();
    this.currentScope = this._scopeStack[this._scopeStack.length - 1];
    log.leave('Leave scope ' + h.getScopeName(scope));
  }.bind(this));
};

Context.prototype.enterFlx = function (rp) {
  var oldFlx = this.currentFlx,
      newFlx = new Fluxion(rp.name, rp.cb);

  newFlx.rupturePoint = rp; // TODO this should be set in the constructor, I put it here only as a quick fix.

  this.currentFlx = newFlx;
  this._flxStack.push(newFlx);

  newFlx.registerParent(oldFlx, rp);

  return this.currentFlx.enter(rp.name);
};

Context.prototype.leaveFlx = function () {
  var flx = this._flxStack.pop();
  this.currentFlx = this._flxStack[this._flxStack.length - 1];
  if (!this.flx[flx.name]) {
    this.flx[flx.name] = flx;
    return flx.leave();
  }

  throw errors.flxConflict(this.currentFlx.name);
};

Context.prototype.processRequire = function(n) {

  var mapper = require('./');

  n.context.root = this;
  n.context = mapper(n.context);

  this.requires.push(n.context);
}

Context.prototype.end = function() {

  function registerDependency(variable, flx, ref){
    if (!flx.dependencies[variable.name]) {
      flx.dependencies[variable.name] = {
        source: variable.scope.flx,
        variable: variable,
        references: (ref ? [ref] : []),
        modified: (ref ? ref.modified : undefined)
      };
    } else if (ref) {
      flx.dependencies[variable.name].references.push(ref);
      flx.dependencies[variable.name].modified = ref.modified || flx.dependencies[variable.name].modified;
    }
  }

  // Leave the root fluxion
  this.leaveFlx();

  // Register variable in fluxion
  this.scopes.forEach(function(scope) {
    scope.variables.forEach(function(variable) {
      
      if (!this.flxTriggers.isReservedIdentifier(variable.name)) {
        
        variable.flxs = {};
        variable.modifierFlxs = {};

        variable.flxs[variable.scope.flx.name] = variable.scope.flx;

        registerDependency(variable, variable.scope.flx)

        variable.references.forEach(function(ref) {
          var name = ref.from.flx.name;
          var flx = ref.from.flx;

          variable.flxs[name] = flx;
          if (ref.modified) {
            variable.modifierFlxs[name] = flx;
          }

          registerDependency(variable, flx, ref);
        }, {});
      }
    }.bind(this));
  }.bind(this));
};

module.exports = Context;
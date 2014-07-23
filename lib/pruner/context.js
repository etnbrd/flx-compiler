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

var escope = require('escope'),
    errors = require('../lib/errors'),
    log = require('../lib/log'),
    h = require('./helpers');

// ## FlxScope

// This object describe a fluxion

function FlxScope(name, ast, root) {
  // + The name of the fluxion is used to receives messages from other fluxions.
  this.name = name;
  // + A fluxion is an independent execution unit, therefor we link the code from the original AST.
  this.ast = ast;
  // + The code execution of a fluxion span over one or more function scopes.
  this.scopes = [];
  // + A fluxion sends messages to downstream fluxions, each stream of message to a downstream fluxion is represented here as an output.
  this.outputs = [];
  // + This fluxion receives messages from upstream fluxions.
  this.parents = [];
  // + Is this fluxion the root of the stream.
  this.root = root;
  // + The linker uses the function scope description to spot broken dependencies between fluxions.
  this.dependencies = {};

  // + Varaible dependencies are of three types : `signature`, `scope` and `sync`.
  this.signature = {};
  this.scope = {};
  this.sync = {};
}

FlxScope.prototype.enter = function () {
  log.enter('Enter flx ' + this.name);
  return this;
};

FlxScope.prototype.leave = function () {
  log.leave('Leave flx ' + this.name);
  return this;
};

FlxScope.prototype._registerScopes = function(scopes) {
  scopes.forEach(function(n) {
    this.scopes.push(n);
  }.bind(this));
  return this;
};

FlxScope.prototype._registerParent = function (parent, output) {
  this.parents.push({parent: parent, output: output});
  return this;
};

FlxScope.prototype._registerOutput = function (output) {
  log.info(this.name + ' // ' + output.source.name +  ' -> ' + output.dest.name);
  this.outputs.push(output);
  this.currentOutput = output;
  return this;
};

// ## Output

// The compiler breaks a program into fluxion along rupture points (asynchronous calls).
// At a rupture point, the fluxion sends a message to the downstream fluxion to replace the asynchronous call.
// The output describes the stream between these two fluxions.

function Output(name, type, params, sourceFlx, destFlx) {
  function formatParam(param) {
    return {
      ast: param,
      name: param.name
    };
  }

  // + The name of the destination fluxion.
  this.name = name;
  // + The type of the rupture points : start, or post
  this.type = type;
  // + The parameters to send for the destination fluxion to call either the callback in a start rupture point, or the asynchronous call in a post rupture point.
  this.params = params.map(formatParam);
  // + The upstream fluxion.
  this.source = sourceFlx;
  // + The downstream fluxion.
  this.dest = destFlx;
  // + The signature of an output is the variables the upstream fluxion needs to send to make sure the scopes of every downstream fluxions are consistent.
  this.signature = {};
}

Output.prototype.registerSign = function (id) {
  log.sig(id.name + log.grey(' // ' + this.source.name + ' -> ' + this.dest.name));
  this.signature[id.name] = {
    name: id.name,
    id: id,
    source: this.source,
    dest: this.dest
  };
};

// ## Context

// The context holds everything needed during the compilation :

function Context (ast, filename) {

  var currentFlx = new FlxScope (filename, ast, true);

  // + The filename
  this.name = filename;
  // + The AST
  this.ast = ast;
  // + Every fluxion
  this.flx = {};
  // + Every function scope
  this.scopes = escope.analyze(ast).scopes;

  // + Pointers to useful pieces of the context to use during the parse.
  this.currentFlx = currentFlx.enter();
  this.currentScope = undefined;
  this._stack = [currentFlx];
  this._scopeStack = [];
  this.fluxionTriggers = [];
}

Context.prototype.enterScope = function (n) {
  var scopes = this.scopes.filter(h.compareScopeByBlock(n));

  // TODO on enter and on leave scope, we do the exact same things : count matching scopes, refactor that so that we don't duplicate code.
  // best with a shared state between the enter and leave, otherwise, with a shared function, or a factory.

  scopes.forEach(function(scope) {
    var name;

    scope.flx = this.currentFlx;

    if (scope.block.id)
      name = scope.block.id.name;
    if (scope.block.type === 'Program') {
      name = 'Program';
    }


    this._scopeStack.push(scope);
    this.currentScope = scope;

    log.enter('Enter scope ' + name);
  }.bind(this));

  this.currentFlx._registerScopes(scopes);

  return scopes;
};

Context.prototype.leaveScope = function(n) {
  var scopes = this.scopes.filter(h.compareScopeByBlock(n));
   
  scopes.forEach(function(scope) {
    var name;

    if (scope.block.id)
      name = scope.block.id.name;
    if (scope.block.type === 'Program')
      name = 'Program';

    scope = this._scopeStack.pop();
    this.currentScope = this._scopeStack[this._stack.length - 1];

    log.leave('Leave scope ' + name);
  }.bind(this));
};

Context.prototype.enterFlx = function (name, ast, type) {

  var _oldFlx = this.currentFlx,
    _newFlx = new FlxScope(name, ast),
    _out;

  this.currentFlx = _newFlx;
  this._stack.push(_newFlx);

  if (type) {
    _out = new Output(name, type, ast.params, _oldFlx, this.currentFlx);

    _newFlx._registerParent(_oldFlx, _out);
    _oldFlx._registerOutput(_out);
  } else {
    if (name !== 'Main') {
      console.log('entering a fluxion without an output');
    }
  }

  return this.currentFlx.enter(name);
};

Context.prototype.leaveFlx = function () {
  var flx = this._stack.pop();
  this.currentFlx = this._stack[this._stack.length - 1];
  if (!this.flx[flx.name]) {
    this.flx[flx.name] = flx;
    return flx.leave();
  }

  throw errors.flxConflict(this.currentFlx.name);
};


Context.prototype.registerModification = function(id) {
  this.currentScope.references.filter(function(ref) {
    return ref.identifier === id;
  }).forEach(function(ref) {
    ref.modified = true;
  });

  return this;
};

Context.prototype.registerFluxionTrigger = function(variableName) {
  return this.fluxionTriggers.push(variableName);
};

Context.prototype.isFluxionTrigger = function(ids) {
  return ids.length === 2 && this.fluxionTriggers.indexOf(ids[0]) > -1 && ids[1] === 'get';
};

Context.prototype.end = function() {

// Leave the root fluxion
  this.leaveFlx();

  // Populate dependencies
  this.scopes.forEach(function(scope) {
    scope.variables.forEach(function(variable) {
      if (!h.reserved(variable.name)) {
        
        h.populate(variable);
        variable.flxs = {};
        variable.modifierFlxs = {};

        variable.references.forEach(function(ref) {
          var name = ref.from.flx.name;
          var flx = ref.from.flx;

          variable.flxs[name] = flx;
          if (ref.modified) {
            variable.modifierFlxs[name] = flx;
          }

          if (!flx.dependencies[variable.name]) {
            flx.dependencies[variable.name] = {
              source: variable.scope.flx,
              variable: variable,
              references: [ref],
              modified: ref.modified
            };
          } else {
            flx.dependencies[variable.name].references.push(ref);
            flx.dependencies[variable.name].modified = ref.modified || flx.dependencies[variable.name].modified;
          }
        }, {});
      }
    });
  });
};

module.exports = Context;
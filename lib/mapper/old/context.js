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
    Output = require('./output.js'),
    flxTriggers = new require('./triggers'),

    errors = require('../lib/errors'),
    log = require('../lib/log'),
    h = require('./helpers');

// ## Context

// The context holds everything needed during the compilation :

function Context (ast, filename, dirname, root) {

  var currentFlx;

  if (root) {
    currentFlx = root.currentFlx;
  } else {
    currentFlx = new Fluxion (filename, ast, true);
    currentFlx.enter();
  }


  // + The filename
  this.name = filename;
  this.dirname = dirname;
  // + The AST
  this.ast = ast;
  // + Every fluxion
  this.flx = {};
  // + Every function scope
  this.scopes = escope.analyze(ast).scopes;

  // + Pointers to useful pieces of the context to use during the parse.
  this.currentFlx = currentFlx;
  this.currentScope = undefined;
  this._stack = [currentFlx];
  this._scopeStack = [];
  this.children = [];
  this.root = root;



  // Populate scope
  this.scopes.forEach(function(scope) {
    scope.variables.forEach(function(variable) {
      if (!h.reserved(variable.name)) {
        h.populate(variable);
      }
    })
  })
}

Context.prototype.enterScope = function (n) {
  n.scopes = this.scopes.filter(h.compareScopeByBlock(n));
  n.scopes.forEach(function(scope) {
    scope.flx = this.currentFlx;
    this._scopeStack.push(scope);
    this.currentScope = scope;

    log.enter('Enter scope ' + h.getScopeName(scope));
  }.bind(this));

  this.currentFlx._registerScopes(n.scopes);
  return n.scopes;
};

Context.prototype.leaveScope = function(n) {
  n.scopes.forEach(function(scope) {
    scope = this._scopeStack.pop();
    this.currentScope = this._scopeStack[this._stack.length - 1];
    log.leave('Leave scope ' + h.getScopeName(scope));
  }.bind(this));
};

Context.prototype.enterFlx = function (name, ast, type) {

  var _oldFlx = this.currentFlx,
    _newFlx = new Fluxion(name, ast),
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

Context.prototype.registerModification = function(id, modification) {
  this.currentScope.references.filter(function(ref) {
    return ref.identifier === id;
  }).forEach(function(ref) {
    ref.modified = true;
    ref.modification = modification;
  });

  return this;
};

Context.prototype.registerFunction = function(id) {
  // TODO tell the scope that the variable id is a function.

  // The problem is where to say it.
  // In the variable declaration : it's too wide, the variable might be reassigned.
  // In the identifier node : it's not wide enough, the next identifier still reference the same variable.

  // The best idea might be to create an array of all the currently function identifier. Maybe.

  // Currently, we only construct the variable traces in the end of the traverse (see Context.prototype.end), we might want to change that, and to populate the variable declarations with its reference during the traverse.
  // This might allow us to accuratly track variable type.
}

Context.prototype.isFunction = function(id) {

  if (id.type === "FunctionExpression"
  ||  id.type === "FunctionDeclaration") {
    return true;
  }

  // TODO else, if it's an identifier, trace back the other identifier to the declaration to find the latest assigned value.
  if (id.type === 'Identifier') {

    var refs = this.currentScope.references.filter(function(ref) {
      return ref.identifier === id;
    })

    console.log(refs);
  }
}

Context.prototype.end = function() {

// Leave the root fluxion
  this.leaveFlx();

  // Register variable in fluxion
  this.scopes.forEach(function(scope) {
    scope.variables.forEach(function(variable) {
      if (!h.reserved(variable.name)) {
        
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

Context.prototype.getHandleOnIdentifierLoc = function(loc) {
  var ref =  this.currentScope.references.filter(function(i) {
    return i.identifier.loc === loc;
  })[0];

  var decl = ref.from.variables.filter(function(i) {
    return i.name === ref.identifier.name;
  })[0];

  if (!decl)
    return null;

  if (decl.defs[0].node.init) {
    decl.defs[0].node.init.id = decl.defs[0].node.id;
    return decl.defs[0].node.init;
  }
  else
    return decl.defs[0].node;
};

Context.prototype.processRequire = function(n) {
  if (n.arguments.length > 0 && n.arguments[0].value && n.arguments[0].value[0] === '.') {
    var filename = h.decypherPath(n.arguments[0].value, this.dirname);

    if (fs.existsSync(filename)) {

      var source = fs.readFileSync(filename);
      var parse = require('esprima').parse;
      var map = require('./');
      var link = require('../linker');

      var ctx = link(map(parse(source, {loc: true}), pth.basename(filename), pth.dirname(filename), this));

    } else {
      console.error('can\'t find module ' + path + ' at ' + filename);
    }
  }
};

module.exports = Context;
// var graphviz = require('./graphviz');
// var path = require('./path');
var errors = require('./errors');
var log = require('./log');

module.exports = {
  Context: Context,
}


// TODO merge Context and FlxScope prototypes, they share most of their properties and methods

////////////////////////////////////////////////////////////////////////////////
// Context                                                                    //
////////////////////////////////////////////////////////////////////////////////

function Context(ast) {
  this._scopes = [];
  this._flx = {};
  this._stack = [];
  this._flxStack = [];
  this.currentScope = undefined;
  this.currentFlx = undefined;
  this.ast = ast;
  this.starts = [];
}

Context.prototype.enterFlx = function(name, ast, type) {
  var _oldFlx = this.currentFlx;
  var _newFlx = new FlxScope(name, ast);

  this.currentFlx = _newFlx;
  this._flxStack.push(_newFlx);

  if (type) {
    var _out = new Output(name, type, _oldFlx, this.currentFlx);
    _newFlx.registerParent(_oldFlx, _out);
    // if (_oldFlx) // TODO scope problem, resolved partially. There should always be an encapsulating Fluxion.
      _oldFlx.registerOutput(_out);
  } else {
    if (name !== "Main")
    console.log("entering a fluxion without an output");
  }

  return this.currentFlx.enter(name);
}

Context.prototype.leaveFlx = function() {
  var flx = this._flxStack.pop();
  this.currentFlx = this._flxStack[this._flxStack.length - 1];
  if (!this._flx[flx.name]) {
    this._flx[flx.name] = flx;
    return flx.leave();
  } else {
    throw flxConflict(this.currentFlx.name);
  }
}

Context.prototype.enterScope = function(name, rootScope) {
  var scope = new FnScope(name, (rootScope ? undefined : this.currentScope), this.currentFlx);
  this._stack.push(scope);
  this.currentScope = scope;
  return scope.enter(name);
}

Context.prototype.leaveScope = function() {
  this.currentScope = this.currentScope.parent;
  var scope = this._stack.pop()
  this._scopes.push(scope);
  return scope.leave();
}

Context.prototype.registerId = function(id) {
  return this.currentScope.registerId(id);
}

Context.prototype.registerVar = function(_var) {
  return this.currentScope.registerVar(_var);
}

Context.prototype.registerOutput = function(output) {
  return this.currentFlx.registerOutput(output);
}

////////////////////////////////////////////////////////////////////////////////
// FlxScope                                                                   //
////////////////////////////////////////////////////////////////////////////////

function FlxScope(name, ast) {
  this.name = name;
  this.ast = ast;
  this.outputs = [];
  this.modifiers = {};
  this.parents = [];
}

FlxScope.prototype.current = function() {
  return this._stack[0];
}

FlxScope.prototype.enter = function(name) {
  log.enter("Enter flx " + this.name);
  return this;
}

FlxScope.prototype.leave = function() {
  log.leave("Leave flx " + this.name);
}

FlxScope.prototype.registerParent = function(parent, output) {
  this.parents.push({parent: parent, output: output});
}

FlxScope.prototype.registerOutput = function(output) {
  log.info(this.name + " // " + output.source.name +  " -> " + output.dest.name);
  this.outputs.push(output);
  this.currentOutput = output;
}

////////////////////////////////////////////////////////////////////////////////
// FnScope                                                                    //
////////////////////////////////////////////////////////////////////////////////

function FnScope(name, parent, flx) {
  this._ids = {};
  this._var = {};
  this.name = name;
  this.parent = parent;
  this.flx = flx;
}

FnScope.prototype.enter = function() {
  log.enter("Enter scope " + this.name);
  return this;
}

FnScope.prototype.leave = function() {
  log.leave("Leave scope " + this.name);
  return this;
}

FnScope.prototype.registerId = function(id) {
  if (id.name) {

    function findVar(scope, name) {
      for (var _var in scope._var) {
        if (_var === name) {
          return scope.flx;
        }
      }

      if (scope.parent) {
        var _par = findVar(scope.parent, name);
        if (_par) {
          scope.parent.flx.currentOutput.registerSign(id);
          return _par;
        }

      }

      return undefined;
    }

    var source = findVar(this, id.name);

    // if (source) {
    //   // log.reg("Signature", id.name, "in", source.name);
    //   source.registerSign(id);
    // }

    if (!this._ids[id.name]) {
      this._ids[id.name] = id;
      log.use(log.bold(id.name) + log.grey(" // " + this.name));
    } else {
      log.use(id.name + log.grey(" // " + this.name));
      // throw errors.identifierConflict([id, this._ids[id.name]]);
    }

    return source;
  }
}

FnScope.prototype.registerVar = function(_var) {

  if (_var.id && _var.id.name) {
    _var = _var.id;
  }

  this._var[_var.name] = _var;
  log.vard(log.bold(_var.name) + log.grey(" // " + this.name));
}

////////////////////////////////////////////////////////////////////////////////
// Output                                                                     //
////////////////////////////////////////////////////////////////////////////////

function Output(name, type, sourceFlx, destFlx) {
  this.name = name;
  this.type = type;
  this.source = sourceFlx;
  this.dest = destFlx;
  this.signature = {};
}

Output.prototype.registerSign = function(id) {
  log.sig(id.name + log.grey(" // " + this.source.name + " -> " + this.dest.name ));
  this.signature[id.name] = {
    name: id.name,
    id: id,
    source: this.source,
    dest: this.dest
  };
}
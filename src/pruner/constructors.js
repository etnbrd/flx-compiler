var escope = require('escope')
,   errors = require('../lib/errors')
,   log = require('../lib/log')
,   helpers = require('../lib/helpers')
;

module.exports = {
  Context: Context
}


// HELPERS TODO move these into the helpers file

function compareScopeByBlock(n) {
  return function(scope) {
    return (scope.block === n)
  }
}

////////////////////////////////////////////////////////////////////////////////
// Context                                                                    //
////////////////////////////////////////////////////////////////////////////////

function Context(ast, filename) {

  var currentFlx = new FlxScope (filename, ast, true); // TODO instead of Main, get the filename

  this.name = ast.name;
  this.ast = ast;
  this.flx = {};
  this.scopes = escope.analyze(ast).scopes;
  this.currentFlx = currentFlx.enter();
  this.currentScope = undefined;
  this._stack = [currentFlx];
  this._scopeStack = [];
}

Context.prototype.enterScope = function (n) {
  var scopes = this.scopes.filter(compareScopeByBlock(n));

  scopes.forEach(function(scope) {
    var name;

    if (scope.block.id)
      name = scope.block.id.name;
    if (scope.block.type === 'Program')
      name = "Program";


    this._scopeStack.push(scope);
    this.currentScope = scope;

    log.enter('Enter scope ' + name);
  }.bind(this))

  this.currentFlx._registerScopes(scopes);

  return scopes;
};

Context.prototype.leaveScope = function(n) {
  var scopes = this.scopes.filter(compareScopeByBlock(n))
   
  scopes.forEach(function(scope) {
    var name;

    if (scope.block.id)
      name = scope.block.id.name;
    if (scope.block.type === 'Program')
      name = "Program";

    var scope = this._scopeStack.pop();
    this.currentScope = this._scopeStack[this._stack.length - 1];

    log.leave('Leave scope ' + name);
  }.bind(this))
}

Context.prototype.enterFlx = function (name, ast, type) {

  var _oldFlx = this.currentFlx,
    _newFlx = new FlxScope(name, ast),
    _out;

  this.currentFlx = _newFlx;
  this._stack.push(_newFlx);

  if (type) {
    _out = new Output(name, type, ast.params, _oldFlx, this.currentFlx);

    _newFlx.registerParent(_oldFlx, _out);
    _oldFlx.registerOutput(_out);
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
  var ref = this.currentScope.references.filter(function(ref) {
    return ref.identifier === id;
  });

  ref.modified = true;
}

Context.prototype.end = function() {
  this.leaveFlx();

  // TODO here is the time to complete signature, modifiers etc ...
}



////////////////////////////////////////////////////////////////////////////////
// FlxScope                                                                   //
////////////////////////////////////////////////////////////////////////////////

function FlxScope(name, ast, root) {
  this.name = name;
  this.ast = ast;
  this.scopes = [];
  this.outputs = [];
  this.parents = [];
  this.root = root;
}

FlxScope.prototype.enter = function () {
  log.enter('Enter flx ' + this.name);
  return this;
};

FlxScope.prototype.leave = function () {
  log.leave('Leave flx ' + this.name);
};

FlxScope.prototype._registerScopes = function(scopes) {
  scopes.forEach(function(n) {
    this.scopes.push(n);
  }.bind(this));

  return this;
}

FlxScope.prototype.registerParent = function (parent, output) {
  this.parents.push({parent: parent, output: output});
};

FlxScope.prototype.registerOutput = function (output) {
  log.info(this.name + ' // ' + output.source.name +  ' -> ' + output.dest.name);
  this.outputs.push(output);
  this.currentOutput = output;
};

// FlxScope.prototype.registerModifier = function (id, type) { // TODO this should be directly triggered by registerId or registerMod

//   // console.log('MODIFIER ', id.name || id, type, !!this.modifiers)

//   if (!this.modifiers[id.name]) {
//     this.modifiers[id.name] = { // TODO might lead to conflict, as scope and fluxion scope aren't the same
//       target : type
//     };
//   } else if (type === 'scope') { // scope modifier is of higher priority
//     this.registerScope(id); // TODO I am not sure if this is the right place for this line (but it seems to work :)
//     this.modifiers[id.name].target = 'scope';
//   }
// };


////////////////////////////////////////////////////////////////////////////////
// Output                                                                     //
////////////////////////////////////////////////////////////////////////////////

function Output(name, type, params, sourceFlx, destFlx) {
  function formatParam(param) {
    return {
      ast: param,
      name: param.name
    };
  }

  this.name = name;
  this.type = type;
  this.params = params.map(formatParam);
  this.source = sourceFlx;
  this.dest = destFlx;
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

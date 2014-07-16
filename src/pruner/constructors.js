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

  // TODO on enter and on leave scope, we do the exact same things : count matching scopes, refactor that so that we don't duplicate code.
  // best with a shared state between the enter and leave, otherwise, with a shared function, or a factory.

  scopes.forEach(function(scope) {
    var name;

    scope.flx = this.currentFlx;

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
  var refs = this.currentScope.references.filter(function(ref) {
    return ref.identifier === id;
  }).forEach(function(ref) {
    ref.modified = true;
  });

  return this;
}

Context.prototype.end = function() {
  this.leaveFlx();

  // TODO move these function to a better place
  function populate(variable) {
    // populate the references array of `variable` with all references from all nested child scope
    function _populate(scopes, variable) {
      scopes.forEach(function(scope) {
        // Break when another variable of the same name is declared
        if (scope.variables.some(function(_variable) {
              return _variable.name === variable.name;
            })) {
          return;
        }

        // Push matching references
        scope.references.forEach(function(reference) {
          if (reference.identifier.name === variable.name) {
            variable.references.push(reference);
          }
        })

        // Recurse
        _populate(scope.childScopes, variable);
      })
    }

    // if (!variable.__populated) {
      if (variable.references.length === 0) {
        // Push local matching references
        variable.scope.references.forEach(function(reference) {
          if (reference.identifier.name === variable.name) {
            variable.references.push(reference);
          }
        })
      }

      // Start scope lookup recursion
      _populate(variable.scope.childScopes, variable);
      // variable.__populated = true;
    // }

    return variable;
  }

  function locateDeclaration(ref) {
    var scope = ref.from;

    do {
      var variable = scope.variables.filter(function(variable) {
        return (variable.name === ref.identifier.name && variable.defs.length)
      })
      if (variable.length > 0) {
        return variable[0];
      }
    } while (scope = scope.upper);

    return null;
  }

  function reserved(name) {
      return !!(name === 'require' || name === 'exports' || name === 'module' || name === 'console');
  }


  this.scopes.forEach(function(scope) {
    scope.variables.forEach(function(variable) {
      if (!reserved(variable.name)) {

        populate(variable);

        var flxs = variable.references.reduce(function(flxs, ref) {
          var name = ref.from.flx.name;

          if (!flxs[name]) {
            flxs[name] = {
              flx: ref.from.flx,
              references: []
            }
          }

          flxs[name].references.push(ref);

          if (ref.modified) {
            flxs[name].modified = true;
          }

          return flxs;
        }, {});

        // TODO there is two iteration, above, and below, one of them is redundant.
        // The conditional about the number of fluxion could be in the linker

        // Problem #3 and #4 : a variable is shared between 2 fluxions
        if (Object.keys(flxs).length === 2) {

          for (var name in flxs) { var flx = flxs[name].flx;

            // console.log(variable);
            // TODO find whether this modifier is in the receiveing fluxion or not : if it's with the declaration or not.
            // so TODO find the root fluxion for each variable

            // if (variable)

            if (!flx.modifiers[variable.name]) {
              flx.modifiers[variable.name] = {
                source: flx,
                variable: variable,
                references: flxs[name].references,
                modified: flxs[name].modified,
              }
            } else {
              throw multipleOccurences();
            }
            
            
          }
        }

        // Problem #5 : a variable is shared between more than 2 fluxions
        if (Object.keys(flxs).length > 2) {


          throw "TODO";

        }


      }
    })
  })
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
  this.modifiers = {};
}

FlxScope.prototype._registerScopes = function(scopes) {
  scopes.forEach(function(n) {
    this.scopes.push(n);
  }.bind(this));

  return this;
}

FlxScope.prototype.enter = function () {
  log.enter('Enter flx ' + this.name);
  return this;
};

FlxScope.prototype.leave = function () {
  log.leave('Leave flx ' + this.name);
  return this;
};

FlxScope.prototype.registerParent = function (parent, output) {
  this.parents.push({parent: parent, output: output});

  return this;
};

FlxScope.prototype.registerOutput = function (output) {
  log.info(this.name + ' // ' + output.source.name +  ' -> ' + output.dest.name);
  this.outputs.push(output);
  this.currentOutput = output;

  return this;
};

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

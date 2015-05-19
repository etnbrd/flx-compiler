// # Fluxion mapper

// The compiler start by parsing the source to generate an Intermediate Representation (IR).
// It uses the [esprima parser](http://esprima.org/), which generates an Abstract Syntax Tree (AST) according to the [SpiderMonkey Parser API](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API).

// The compiler then generate a scope description object from the AST, using [escope](https://github.com/Constellation/escope)


// The pruner iterate over the AST to detect rupture points.
// From a rupture point, a new fluxion is created containing the asynchronous execution.

// Each fluxion contains one or multiple function scopes.
// The pruner map each function scope to the corresponding fluxion.
// The linker uses this map to resolve variable dependencies.

// 'use strict';

var fs = require('fs'),
    pth = require('path'),
    escope = require('escope'),
    FlxTriggers = require('./triggers'),
    errors = require('../lib/errors'),
    estraverse = require('estraverse'),
    log = require('../lib/log'),
    h = require('./helpers'),
    salt = 1000;

// ## Context

// The context holds everything needed during the compilation :

function Context (ast, filename, dirname, root) {
  // + The filename
  this.name = filename;
  this.dirname = dirname;
  this.root = root;
  // + The AST
  this.ast = ast;

  // + Every function scope
  this.scopes = escope.analyze(ast).scopes;

  this._scopeStack = [];
  this.requires = [];
  this.root = root;

  this.flxTriggers = new FlxTriggers();
  this.rupturePoints = [];

  // Populate scopes
  this.scopes.forEach(function(scope) {
    scope.variables.forEach(function(variable) {
      // if (!flxTriggers.isReservedIdentifier(variable.name)) {
        h.populate(variable);
      // }
    })
  })


  var scopes = this.scopes; // needed by the variable tracker in whatIsIt


  var ssa = {
    blocks: [],
    currentBlock: undefined,
    variables: {}

  };

  var salt = 0;

  function newVariable(name, decl) {
    if (!ssa.variables[name]) {

      var newVariable = {
        name: name,
        declaration: decl,
        valueChains: [],
        currentChain: undefined
      }

      ssa.variables[name] = newVariable;

      return newVariable;

    } else
      throw 'ERROR double variable ' + name;
  }




  _iterator = {
    enter: function(n, p) {
      // if (n.type === 'VariableDeclarator') {

      //   var v = newVariable(n.id.name, n);
      //   // TODO find variable in scope.

      //   var newChain = {
      //     value: n,
      //     references: []
      //   }

      //   v.valueChains.push(newChain)
      //   v.currentChain = newChain;
      // }

      if (n.type === 'AssignmentExpression') {
        // console.log(ssa.variables[n.left.name]);
        // console.log(n);

        if (ssa.variables[n.left.name]) {

          var newChain = {
            value: n,
            references: []
          }

          ssa.variables[n.left.name].valueChains.push(newChain);
          ssa.variables[n.left.name].currentChain = newChain;
        }


      }

      if (n.type === 'Identifier') {
        if (ssa.variables[n.name] && n.parent.type != 'MemberExpression') { // TODO fix the member expression later. the problem is : if I declare a variable app with a certain value, and I use export.app, then the identifier in the export.app is listed as a reference to the app variable.

          ssa.variables[n.name].currentChain.references.push(n);

          n.value = ssa.variables[n.name].currentChain.value;

          console.log(n.name, n.loc, n.value);
          console.log('\n --- \n');

        }
      }
    }
  }

  estraverse.traverse(ast, _iterator);



  // console.log(require('util').inspect(ssa.variables, false, 4));


  // for (var name in ssa.variables) { var variable = ssa.variables[name];


  //   console.log(' --- ');
  //   console.log(variable.name);
  //   console.log(variable.declaration);

  //   variable.valueChains.forEach(function(value) {
  //     console.log(value.value);

  //     console.log(value.references);
  //   })

  // }














  function newBlock(n) {

    var newBlock = {
      id: salt++,
      ast: n,
      dep: []
    };

    ssa.currentBlock = newBlock;
    ssa.blocks.push(newBlock);
  }

  function returnValueOf(n) {

    if (n.type === 'CallExpression') {

      var callee = whatIsIt(n.callee);

      if (callee === 'require') {

        // TODO this should be part of a dictionnary of async modules 
        if (whatIsIt(n.arguments[0]) === 'express') {
          return 'AnExpressFactory';
        }
      }

      if (callee === 'AnExpressFactory') {
        return 'AnExpressServer';
      }

      return returnValueOf(n.callee);

    }

    return undefined;
  }


  function whatIsIt(n) {


    // console.log('What is ' + n.type);

    if (n.type === 'FunctionExpression'
    ||  n.type === 'FunctionDeclaration') {
      return 'function'
    }

    if (n.type === 'Literal') {
      return n.value;
    }

    if (n.type === 'Identifier') {
      return n.name;
    }

    if (n.type === 'MemberExpression') {

      if (n.computed)
        return whatIsIt(n.object) + '[' + whatIsIt(n.property) + ']';
      else 
        return whatIsIt(n.object) + '.' + whatIsIt(n.property);
    }


    if (n.type === 'CallExpression') {

      // console.log('What is the return value of ' + whatIsIt(n.callee) + ' : ' + returnValueOf(n));

      return returnValueOf(n);

    }

  }


  var _types = {
    enter: function(n, p) {

      if (n.type === 'Program') {
        newBlock(n);
      }


      if (n.type === 'VariableDeclarator') {
        console.log(whatIsIt(n.id) + ' <= ' + whatIsIt(n.init));

        ssa.currentBlock.dep.push({
          type: 'Declaration',
          source: n.init,
          target: n
        })

      }



      if (n.type === 'AssignmentExpression') {




        console.log(whatIsIt(n.left) + ' <' + n.operator + ' ' + whatIsIt(n.right));


        ssa.currentBlock.dep.push({
          type: 'Assignment',
          source: n.right,
          target: n.left
        })


      }
    }
  }

  // estraverse.traverse(ast, _types);


  // scopes.forEach(function(scope) {

  //   console.log(scope);

  // })

  // // ssa.blocks[0].dep.push({
  // //   type: 'Continuity',
  // //   source: ,
  // //   target:
  // // })


  // console.log(ssa.blocks[0].dep);




}

Context.prototype.enterScope = function (n) {
  n.scopes = this.scopes.filter(h.compareScopeByBlock(n));
  n.scopes.forEach(function(scope) {
    this._scopeStack.push(scope);
    this.currentScope = scope;

    log.enter('Enter scope ' + h.getScopeName(scope));
  }.bind(this));

  return n.scopes;
};

Context.prototype.leaveScope = function(n) {
  n.scopes.forEach(function(scope) {
    scope = this._scopeStack.pop();
    this.currentScope = this._scopeStack[this._scopeStack.length - 1];
    log.leave('Leave scope ' + h.getScopeName(scope));
  }.bind(this));
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

Context.prototype.isFunction = function(id) {

  // TODO this function is a mess : refactor.

  if (id.context) {
    var global = h.singlify(id.context.scopes.filter(function(scope) {
      return scope.type === 'global';
    }));

    var references = global.through.filter(function(ref) {
      return ref.identifier.name === 'module';
    })

    var fns = references.reduce(function(prev, ref) {
      var parent = ref.identifier.parent;

      console.log(ref.identifier);

      while (parent.parent && parent.type === 'MemberExpression' ) {
        parent = parent.parent;
      }

      if (parent.type === 'AssignmentExpression') {
        prev.push(this.isFunction(parent.right));
        return prev;
      }

    }.bind(this), []).filter(function(fn) {
      return fn;
    });

    if (fns.length > 1) {
      console.log("WARNING : we are missing a function from a module because it is assigned multiple times");
    } else {
      return fns[0];
    }

  }

  if (id.type === "FunctionExpression"
  ||  id.type === "FunctionDeclaration") {
    return id;
  }

  if (id.type === 'Identifier') {

    var ref = h.singlify(this.currentScope.references.filter(function(ref) {
      return ref.identifier === id;
    }));

    // if (!ref.resolved) {
      // throw errors.missingDeclaration(ref.identifier.name)
    // }

    /* README
     * ref represent the reference(s?) of the identifier
     * def is the list of definitions, with the type of assignation
     * I exclude type parameter because it causes a bug : it returns the function as the assigned value of the parameter -> fn(a) : returns that the variable a holds the value fn, which is completly false.
     * It is very probable that other kind of assignation cause bugs as well
     * I would filter only what works, but I don't know the types (probably VariableDeclaration, assignation or similar).
     */

    if (ref.resolved) {
      var def = ref.resolved.defs.slice(-1)[0]; // slice does a shallow copy of the last item of the array. I don't exacty remember why I use this. Either I wanted a safe copy of the definition, which would be dumb, or I wanted only the last element of the array, and was too lazy to write .length.

      if (def.type === 'Parameter') {
        return false;
      }

      return this.isFunction(def.node.init || def.node);
    }

    // TODO we need to find the last known value of this identifier to know if it was a function.
    // For now, we only check the last definition
    // Later we should trace the identifier to get the last modification.
  }

  return false;

  // TODO don't analyse memberExpressions.

  if (id.type === 'MemberExpression') {
    var collector = h.collectId(id);

    if (!collector.computed) {
      // TODO find the variable declaration the reference point to.
      // track back every reference to see if one match the filter.
      // Warning, stuff like : a.b.c = fn ; a.b = truc might happen, prevent problems in this case.

      var ref = h.singlify(this.currentScope.references.filter(function(ref) {
        return ref.identifier === id.object;
      }));


      if (ref.resolved) {
        var decl = ref.resolved.defs.slice(-1)[0].node;

        if (decl.init.type === 'ObjectExpression') {

          function checkProp(ids, property) {
            if (ids[0] === property.key.name) {
              if(ids.length === 1)
                return true;
              // else
                // checkProp(ids.slice(1), property)
            }
            return false;
          }

          var val = h.singlify(decl.init.properties.filter(function(p) {
            return checkProp(collector.ids.slice(1), p);
          })).value;

          return this.isFunction(val);
          
        } else {
          console.log('DUNNO WAT TO DO WITH : ', decl.init.type);
        }


      }

      // var occurences = ref.references.map(function(ref) {
      //   if (ref.identifier.parent.type === "MemberExpression")
      //     return ref.identifier.parent;
      //   else
      //     return ref.identifier;
      // });

      // var ids = occurences.map(h.collectId);

      // console.log(ids);

    }

    // var ref = this.currentScope.references.filter(function(ref) {
    //   return ref.identifier === id.object;
    // })[0];

    // console.log(ref);


    // TODO module.exports is not in a variable declaration
    // We need to track every occurence of module.exports, or exports to find which properties are functions.

  }

  return false;
}

Context.prototype.processRequire = function(n) {

  // console.log('processRequire');

  if (n.arguments.length > 0 && n.arguments[0].value && n.arguments[0].value[0] === '.') {

    var filename = h.decypherPath(n.arguments[0].value, this.dirname);

    if (fs.existsSync(filename)) {

      var source = fs.readFileSync(filename);
      // var compile = require('..');
      // var analyze = require('./');

      // var esprima = require('esprima');

      // var code = esprima.parse(source, {loc: true});

      var parser = require('../parser');
      var analyze = require('./');

      var code = parser(source);
      var ctx = analyze(code, pth.basename(filename), pth.dirname(filename), this)

      // console.log(filename, ctx);

      n.context = ctx;

      // var ctx = link(map(parse(source, {loc: true}), pth.basename(filename), pth.dirname(filename), this));

      // TODO return the modification description for module.exports from ctx : it will be used to detect flxTrigger in this module with callback defined in another module.

    } else {
      console.error('can\'t find module ' + filename);
    }
  }
};

Context.prototype.flxName = function(n, name) {

  var rp = this.rupturePoints.filter(function(rp) {
    return rp.cb === n;
  })

  if (rp.length > 1)
    throw errors.multipleOccurences(rp);

  if (rp.length > 0)
    return rp[0].name;

  var base = (name || (n.id ? n.id.name : 'anonymous'));

  return base + '-' + salt++;
}

Context.prototype.placeRupturePoint = function(cb, n, i, type) {

  var name, rupturePoint;

  if (n.arguments[i].type === 'Identifier')
    name = n.arguments[i].name;

  name = this.flxName(cb, name);
  rupturePoint = {
    name: name,
    type: type,
    cb: cb,
    call: n,
    cbIndex: i
  }

  this.rupturePoints.push(rupturePoint);
  n.rupturePoint = rupturePoint;
  cb.rupturePoint = rupturePoint;

  log.rp('rupture point ' + name + ' on ' + require('escodegen').generate(n.callee));

  return rupturePoint;
}

module.exports = Context;
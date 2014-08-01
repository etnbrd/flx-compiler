var esprima = require('esprima'),
  iteratorFactory = require('../../lib/iterators'),
  estraverse = require('estraverse'),
  getIdIterator = require('./getid'),
  Context = require('../context'),
  h = require('../../lib/helpers');

var _types = {};

_types.FunctionDeclaration = 
_types.FunctionExpression = 
_types.Program = {
  enter: function (n, p, c) {
    c.enterScope(n);
  },
  leave: function (n, p, c) {
    c.leaveScope(n);
  }
};

//   variableDeclarator(patt, init[, loc])
_types.VariableDeclarator = {
  enter: function (n, p, c) {
    if (n.init.type === 'CallExpression') {
      var requireStmt = n.init.callee;
      if (!requireStmt.callee)
          requireStmt = n.init;

      if (requireStmt.callee.name === 'require')
        c.registerPotentialFluxionTrigger(requireStmt.arguments[0].value, n.id.name);
    }
  }
};

//   callExpression(callee, args[, loc])
_types.CallExpression = {
  enter: function (n, p, c) {
    // TODO this is bad design
    var _c = {ids: []};
    estraverse.traverse(n.callee, getIdIterator(_c));

    // If a local file is required
    if (_c.ids[0] === 'require' && n.arguments.length > 0 && n.arguments[0].value[0] === '.') {

      var filename = n.arguments[0].value.split('/').pop(),
          dirname = c.dirname + '/' + n.arguments[0].value.split('/').slice(0, 1).join('/');

      if (filename.lastIndexOf('.js') !== filename.length - 3) {
        filename = filename + '.js';
      }     

      var module = {
        pre:  '(function (exports, require, module, __filename, __dirname) {',
        post: '}).apply(module.exports, [module.exports, require, module, \'' + filename + '\', \'' + dirname + '\']);'
      }

      var source = module.pre + require('fs').readFileSync(dirname + '/' + filename).toString() + module.post;
      var ast = esprima.parse(source);

      if (p.type === "VariableDeclarator") { // Most of the cases are AssignExpr, still TODO fix this.
        p.right = ast.body;
        estraverse.traverse(ast.body[0], mainIterator(c));
      }


      // 

      //  ----------------- OLD ----------------- 

      // TODO need heavy refactoring :
      // + we shouldn't have to use esprima here
      // + we shouldn't directly push stuffs in c.children,
      // + what to do with the context.children ??
      // TODO dynamic path instead of this "./examples/"
      // var file = require('fs').readFileSync('./examples/' + filename).toString();
      // var ast = esprima.parse(file);

      // var context = new Context(ast, filename);

      // c.children.push({
      //   name: filename,
      //   scope: c.currentScope,
      //   astNode: n,
      //   context: context
      // });

      // estraverse.traverse(ast, mainIterator(context));
      // context.end();
    }

    c.fluxionTrigger(_c.ids, {
      start: function() {
        n.arguments.forEach(function (_n, i) {
          if (_n.type === 'FunctionExpression' || _n.type === 'FunctionDeclaration') {

            var name = h.generateFluxionNameFromId(_n.id);

            n.arguments[i] = {
              type: 'Identifier',
              name: name,
              kind: 'start'
            };

            c.enterFlx(name, _n, 'start');
            estraverse.traverse(_n, mainIterator(c));
            c.leaveFlx();

            // n.arguments[i].skip(); // TODO
          }
        });
      },
      post: function() { // TODO duplication
        n.arguments.forEach(function (_n, i) {
          if (_n.type === 'FunctionExpression' || _n.type === 'FunctionDeclaration') {

            var name = h.generateFluxionNameFromId(_n.id);

            n.arguments[i] = {
              type: 'Identifier',
              name: name,
              kind: 'post'
            };

            c.enterFlx(name, _n, 'post');
            estraverse.traverse(_n, mainIterator(c));
            c.leaveFlx();

            // n.arguments[i].skip(); // TODO
          }
        });
      }
    });
  }
};

_types.UpdateExpression =
_types.AssignmentExpression = {
  enter: function (n, p, c) {

    // MemberExpression || UpdateExpression
    var id = n.left || n.argument;

    if (id.type === 'MemberExpression') {
      id = id.object;
    }

    if (id && !c.isReservedIdentifier(id.name)) {
      c.registerModification(id);
    }

    // TODO detect if a function is assigned to a variable, see context.js.
    // if (c.isFunction(n.right.type)) {
    //   c.registerFunction(id);
    // }
  }
};

var mainIterator = iteratorFactory(_types);

module.exports = mainIterator;

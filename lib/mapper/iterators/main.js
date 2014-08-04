var esprima = require('esprima'),
  iteratorFactory = require('../../lib/iterators'),
  estraverse = require('estraverse'),
  getIdIterator = require('./getid'),
  h = require('../../lib/helpers');

function processRequire(collector, node, parent, context) {
  // If a local file is required
  if (collector.ids[0] === 'require' && node.arguments.length > 0 && node.arguments[0].value[0] === '.') {

    var filename = node.arguments[0].value.split('/').pop(),
        dirname = context.dirname + '/' + node.arguments[0].value.split('/').slice(0, 1).join('/');

    if (filename.lastIndexOf('.js') !== filename.length - 3) {
      filename = filename + '.js';
    }     

    var module = {
      pre:  '(function (exports, require, module, __filename, __dirname) {',
      post: '}).apply(module.exports, [module.exports, require, module, \'' + filename + '\', \'' + dirname + '\']);'
    };

    var source = module.pre + require('fs').readFileSync(dirname + '/' + filename).toString() + module.post;
    var ast = esprima.parse(source);

    if (parent.type === 'VariableDeclarator') { // Most of the cases are AssignExpr, still TODO fix this.
      parent.right = ast.body;
      estraverse.traverse(ast.body[0], mainIterator(context));
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
    //   astNode: node,
    //   context: context
    // });

    // estraverse.traverse(ast, mainIterator(context));
    // context.end();
  }
}

function declareFluxion(name, type) {
  return {
    type: 'Identifier',
    name: h.generateFluxionNameFromId(name),
    kind: type
  };
}

function processFluxion(context, node, type) {
  return function() {
    node.arguments.forEach(function(fluxion, i) {
      var flxDeclaration;

      switch (fluxion.type) {
        case 'FunctionExpression':
        case 'FunctionDeclaration':
          flxDeclaration = declareFluxion(fluxion.id, type);
          node.arguments[i] = flxDeclaration;
          break;
        case 'Identifier':
          var fluxionSrc = context.getHandleOnIdentifierLoc(fluxion.loc);

          if (fluxionSrc) {
            // TODO : find a way to crawl fluxionSrc with the right context and so on...
            flxDeclaration = declareFluxion(fluxionSrc.id, type);
            console.log(flxDeclaration);
            // TODO : like that : processFluxion(context, fluxionSrc, type);
            return; // TODO : rm
          }
          else
            return;

          break;
        default:
          return;
      }

      context.enterFlx(flxDeclaration.name, fluxion, type);
      estraverse.traverse(fluxion, mainIterator(context));
      context.leaveFlx();
    });
  };
}

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
    var collector = {ids: []};
    estraverse.traverse(n.callee, getIdIterator(collector));

    processRequire(collector, n, p, c);

    c.fluxionTrigger(collector.ids, {
      start: processFluxion(c, n, 'start'),
      post: processFluxion(c, n, 'post')
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

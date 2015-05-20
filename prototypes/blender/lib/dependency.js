var errors = require("./errors");
var cons = require("./constructors");
var h = require("./helpers");

module.exports = start;

var _types = {};

function start(ast) {
  return _next(ast.program, new cons.DepBuilder());
}

function _next(n, c) {
  if (!n.type)
    throw errors.missingType(n);

  if (!_types[n.type])
    throw errors.missingHandler(n);

  return _types[n.type](n, c);
}

/******************************************************************************************
 * TYPES                                                                                  *
 ******************************************************************************************


Programs
  program(body[, loc])

Statements
  emptyStatement([loc])
  blockStatement(body[, loc])
  expressionStatement(expr[, loc])
  labeledStatement(label, body[, loc])
  ifStatement(test, cons, alt[, loc])
  switchStatement(disc, cases, isLexical[, loc])
  whileStatement(test, body[, loc])
  doWhileStatement(body, test[, loc])
  forStatement(init, test, update, body[, loc])
  forInStatement(left, right, body, isForEach[, loc])
  breakStatement(label[, loc])
  continueStatement(label[, loc])
  withStatement(obj, body[, loc])
  returnStatement(arg[, loc])
  tryStatement(body, handlers, fin[, loc])
  throwStatement(arg[, loc])
  debuggerStatement([loc])
  letStatement(head, body[, loc])

Declarations
  functionDeclaration(name, args, body, isGenerator, isExpression[, loc])
  variableDeclaration(kind, dtors[, loc])
  variableDeclarator(patt, init[, loc])

Expressions
  sequenceExpression(exprs[, loc])
  conditionalExpression(test, cons, alt[, loc])
  unaryExpression(op, arg, isPrefix[, loc])
  binaryExpression(op, left, right[, loc])
  assignmentExpression(op, left, right[, loc])
  logicalExpression(op, left, right[, loc])
  updateExpression(op, arg, isPrefix[, loc])
  newExpression(callee, args[, loc])
  callExpression(callee, args[, loc])
  memberExpression(obj, prop, isComputed[, loc])
  functionExpression(name, args, body, isGenerator, isExpression[, loc])
  arrayExpression(elts[, loc])
  objectExpression(props[, loc])
  thisExpression([loc])
  graphExpression(index, expr[, loc])
  graphIndexExpression(index[, loc])
  comprehensionExpression(body, blocks, filter[, loc])
  generatorExpression(body, blocks, filter[, loc])
  yieldExpression(arg[, loc])
  letExpression(head, body[, loc])

Patterns
  arrayPattern(elts[, loc])
  objectPattern(props[, loc])
  propertyPattern(key, patt[, loc])

Clauses
  switchCase(test, cons[, loc])
  catchClause(arg, guard, body[, loc])
  comprehensionBlock(left, right, isForEach[, loc])

Miscellaneous
  identifier(name[, loc])
  literal(val[, loc])
  property(kind, key, val[, loc])

*/

_types._block = function(n, c) {
  return n.body.reduce(_types._before(c), undefined);
}

_types._before = function(c) {
  return function(previous, current) {
    node = _next(current, c);
    if (previous)
      c.pushDep(new cons.Dep(previous.id, node.id, "Before"));
    return node;
  }
}


////////////////////////////////////////////////////////////////////////////////
// Programs                                                                   //
////////////////////////////////////////////////////////////////////////////////

//   program(body[, loc])
_types.Program = function(n, c) {
  var id = h.hash(n);
  c.pushContext(new cons.Context(n.type, id));
  _types._block(n, c);
  return c.popContext();
}

////////////////////////////////////////////////////////////////////////////////
// Statements                                                                 //
////////////////////////////////////////////////////////////////////////////////

//   emptyStatement([loc])
// TODO


//   blockStatement(body[, loc])
_types.BlockStatement = function(n, c) {
  return _types._block(n, c);
}

//   expressionStatement(expr[, loc])
_types.ExpressionStatement = function(n, c) {
  return _next(n.expression, c);
}

//   labeledStatement(label, body[, loc])
// TODO

//   ifStatement(test, cons, alt[, loc])
// TODO

//   switchStatement(disc, cases, isLexical[, loc])
// TODO

//   whileStatement(test, body[, loc])
// TODO

//   doWhileStatement(body, test[, loc])
// TODO

//   forStatement(init, test, update, body[, loc])
// TODO

//   forInStatement(left, right, body, isForEach[, loc])
// TODO

//   breakStatement(label[, loc])
// TODO

//   continueStatement(label[, loc])
// TODO

//   withStatement(obj, body[, loc])
// TODO

//   returnStatement(arg[, loc])
_types.ReturnStatement = function(n, c) {
  var hash = h.hash(n);
  c.pushDep(new cons.Dep(_next(n.argument, c).id, hash, "return"));
  return c.pushNode(new cons.Node(n, 'return', hash, "ReturnStatement"));
}

//   tryStatement(body, handlers, fin[, loc])
// TODO

//   throwStatement(arg[, loc])
// TODO

//   debuggerStatement([loc])
// TODO

//   letStatement(head, body[, loc])
// TODO


////////////////////////////////////////////////////////////////////////////////
// Declarations                                                               //
////////////////////////////////////////////////////////////////////////////////

//   functionDeclaration(name, args, body, isGenerator, isExpression[, loc])
_types.Param = function(n, c) {
  return new cons.Node(n, _next(n, c), h.hash(n), 'Param');
}

_types.FunctionDeclaration = function(n, c) {
  var next = _next(n.id, c);
  var node = c.pushNode(new cons.Node(n, next.name, h.hash(n), 'FunctionDeclaration'));
  var params = n.params.map(function(param) {
    return _types.Param(param, c);
  })

  c.pushContext(new cons.Context(node.name, node.id, params));

  params.forEach(function(param) {
    c.pushNode(param);
  })
  _next(n.body, c);

  c.popContext();
  return node;
}

//   variableDeclaration(kind, dtors[, loc])
_types.VariableDeclaration = function(n, c) {
  return n.declarations.reduce(_types._before(c), undefined);;
}

//   variableDeclarator(patt, init[, loc])
_types.VariableDeclarator = function(n, c) {
  var node = c.pushNode(new cons.Node(n, _next(n.id, c), null, 'VariableDeclarator', {scope: c[0].id}));
  var dep = c.pushDep(new cons.Dep(_next(n.init, c).id, node.id, 'VariableDeclarator'));
  return node;
}

////////////////////////////////////////////////////////////////////////////////
// Expressions                                                                //
////////////////////////////////////////////////////////////////////////////////

//   sequenceExpression(exprs[, loc])
// TODO

//   conditionalExpression(test, cons, alt[, loc])
// TODO

//   unaryExpression(op, arg, isPrefix[, loc])
// TODO


//   binaryExpression(op, left, right[, loc])
_types.BinaryExpression = function(n, c) {
  var name = n.operator;
  var node = new cons.Node(n, name, h.hash(n), "BinaryExpression", {operator: n.operator});

  ['right', 'left'].forEach(function(op) {    
    var _node = _next(n[op], c);

    if (_node.kind === "Identifier") {
      c.pushNode(_node);
    }

    c.pushDep(new cons.Dep(_node.id, node.id, op, {side: op}));
  })

  return c.pushNode(node);
}

//   assignmentExpression(op, left, right[, loc])
_types.AssignmentExpression = function(n, c) {
  var name = n.operator;

  var ops = ['right', 'left'].map(function(op, index) {    
    var node = _next(n[op], c);

    if (node.kind === "Identifier")
      c.pushNode(node);

    if (op === "left" && node.kind === "VariableDeclarator") {
      return c.pushNode(new cons.Node(n[op], node.name, h.hash(n), "VariableDeclarator", {version: node.version + 1 || 1}));
    }

    return node;
  })

  c.pushDep(new cons.Dep(ops[0].id, ops[1].id, "Assignment", {operator: n.operator}));

  return ops[1];
}

//   logicalExpression(op, left, right[, loc])
_types.LogicalExpression = function(n, c) {
  var name = n.operator;
  var node = new cons.Node(n, n.operator, h.hash(n), "LogicalExpression");

  ['left', 'right'].forEach(function(op) {    
    var _node = _next(n[op], c);
    c.pushDep(new cons.Dep(_node.id, node.id, n[op]));

    if (_node.kind === "Identifier")
      c.pushNode(_node);
  })

  return node;
}

//   updateExpression(op, arg, isPrefix[, loc])
// TODO

//   newExpression(callee, args[, loc])
// TODO

//   callExpression(callee, args[, loc])
_types.Argument = function(n, c) {
  var node = _next(n, c);
  return new cons.Node(n, node.name, node.id, 'Param');
}

_types.CallExpression = function(n, c) {
  var salt = h.salt();
  var next = _next(n.callee, c);
  var node = c.pushNode(new cons.Node(n, next.name, h.hash(n, salt), "CallExpression"));

  if (next.kind === "Identifier")
    c.pushNode(next);

  c.pushDep(new cons.Dep(next.id, node.id, "Callee"));

  n.arguments.forEach(function(argument, index) {
    var arg = _types.Argument(argument, c);
    c.pushDep(new cons.Dep(arg.id, node.id, "Argument", {index: index}));
  });

  return node;
}

//   memberExpression(obj, prop, isComputed[, loc])
_types.MemberExpression = function(n, c) {
  var hash = h.hash(n);
  var options = ["object", "property"].reduce(function(options, op) {
    var _node = _next(n[op], c);
    options[op] = _node;

    if (_node.kind === "Identifier")
      c.pushNode(_node);

    c.pushDep(new cons.Dep(_node.id, hash, op, {computed: n.computed}));

    return options;
  }, {})

  options.name = (n.computed) ? (options.object.name + "[" + options.property.name + "]") : (options.object.name + "." + options.property.name);

  return c.pushNode(new cons.Node(n, "__name__", hash, "MemberExpression", options));
}

//   functionExpression(name, args, body, isGenerator, isExpression[, loc])
_types.FunctionExpression = _types.FunctionDeclaration;

//   arrayExpression(elts[, loc])
// TODO

//   objectExpression(props[, loc])
_types.ObjectExpression = function(n, c) {

  n.properties.forEach(function(property) {
    _next(n.property, c);
  })

  // TODO
  throw "TODO"

  return "ObjectLiteral";
}

//   thisExpression([loc])
// TODO

//   graphExpression(index, expr[, loc])
// TODO

//   graphIndexExpression(index[, loc])
// TODO

//   comprehensionExpression(body, blocks, filter[, loc])
// TODO

//   generatorExpression(body, blocks, filter[, loc])
// TODO

//   yieldExpression(arg[, loc])
// TODO

//   letExpression(head, body[, loc])
// TODO


////////////////////////////////////////////////////////////////////////////////
// Patterns                                                                   //
////////////////////////////////////////////////////////////////////////////////

//   arrayPattern(elts[, loc])
// TODO

//   objectPattern(props[, loc])
// TODO

//   propertyPattern(key, patt[, loc])
// TODO


////////////////////////////////////////////////////////////////////////////////
// Clauses                                                                    //
////////////////////////////////////////////////////////////////////////////////

//   switchCase(test, cons[, loc])
// TODO

//   catchClause(arg, guard, body[, loc])
// TODO

//   comprehensionBlock(left, right, isForEach[, loc])
// TODO


////////////////////////////////////////////////////////////////////////////////
// Miscellaneous                                                              //
////////////////////////////////////////////////////////////////////////////////

//   identifier(name[, loc])
_types.Identifier = function(n, c) {

  var ids = c.reduce(function(ids, _c) {
    return ids.concat(_c.nodes.filter(function(id) {
      return id.name === n.name
    }))
  }, []);

  if (ids.length === 1) {
    return ids[0];
  } else if (ids.length === 0) {
    return new cons.Node(n, n.name, h.hash(n), "Identifier");
  } else if (ids.every(function(id) {
        return id.kind === "VariableDeclarator"
      })) {

      return ids.reduce(function(maxId, id) {
        return (maxId.version < id.version) ? id : maxId;
      })
  } else {
    throw errors.identifierConflict(ids);
  }
}

//   literal(val[, loc])
_types.Literal = function(n, c) {
  return c.pushNode(new cons.Node(n, n.value, h.hash(n), "Literal"));
}

//   property(kind, key, val[, loc])
// TODO
var b = require("recast").types.builders;

var errors = require("./errors");
var cons = require("./constructors");
var h = require("./helpers");

module.exports = start;

var _types = {};

function start(tree) {
  // Get the bottom nodes
  return tree.nodes.filter(function(node) {
    return tree.deps.every(function(dep) {
      return dep.id !== node.id;
    })
  }).map(function(node) {
    return _next(node, tree);
  })
}

function _next(n, c) {

  console.log(">> ", n);

  if (!n.kind)
    throw errors.missingType(n);

  if (!_types[n.kind])
    throw errors.missingHandler(n);

  return _types[n.kind](n, c);
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

////////////////////////////////////////////////////////////////////////////////
// Programs                                                                   //
////////////////////////////////////////////////////////////////////////////////

//   program(body[, loc])

////////////////////////////////////////////////////////////////////////////////
// Statements                                                                 //
////////////////////////////////////////////////////////////////////////////////

//   emptyStatement([loc])
// TODO

//   blockStatement(body[, loc])
// TODO

//   expressionStatement(expr[, loc])
// TODO

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
// TODO

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
// TODO

//   variableDeclaration(kind, dtors[, loc])
// TODO

//   variableDeclarator(patt, init[, loc])
_types.VariableDeclarator = function(n, t) {

  // TODO we might not find Assignment dependency, but there is still other dependency, like VariableDeclarator
  // but if variable is global, need to put it in a different chain of compilation.
  // We could return {global: [], local: []} and a peeler function to plug everything correctly by merging stuffs.

  var upwards = t.deps.filter(h.toFinder(n.id));
  if (upwards.length > 1) throw errors.multipleOccurences(upwards);
  else  upwards = upwards[0];

  if (upwards && (upwards.type == "Assignment" || upwards.type === "VariableDeclarator")) {
    var up = t.nodes.filter(h.idFinder(upwards.id));
    if (up.length > 1) throw errors.multipleOccurences(up);
    else  up = up[0];

    var id = _types.Identifier(n, t); // TODO bad design
    var ass = _next(up, t);

  
    return b.variableDeclarator(id, ass);
  } else {
    return this.Identifier(n, t);
  }
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
_types.BinaryExpression = function(n, t) {
  var ops = ['left', 'right'].map(function(op) {
    // transform the op name in their respective dependencies
    return t.deps.filter(function(dep) {
      return dep.to === n.id && dep.side === op;
    })[0]
  }).map(function(op) {
    // transform the dependencies in their respective up nodes
    return t.nodes.filter(function(n) {
      return n.id === op.id
    })[0] // TODO might lead to some problems
  }).map(function(op) {
    // build the nodes
    return _next(op, t);
  })

  ops.unshift(n.operator);

  return b.binaryExpression.apply(this, ops);
}

//   assignmentExpression(op, left, right[, loc])
// TODO

//   logicalExpression(op, left, right[, loc])
// TODO

//   updateExpression(op, arg, isPrefix[, loc])
// TODO

//   newExpression(callee, args[, loc])
// TODO

//   callExpression(callee, args[, loc])
// TODO

//   memberExpression(obj, prop, isComputed[, loc])
_types.MemberExpression = function(n, t) {
  var ops = ['object', 'property'].map(function(op) {
    // transform the op name in their respective dependencies
    return t.deps.filter(function(dep) {
      return dep.to === n.id && dep.type === op;
    })[0]
  }).map(function(op) {
    // transform the dependencies in their respective up nodes
    return t.nodes.filter(function(node) {
      return node.id === op.id
    })[0]
  }).map(function(op) {
    // build the nodes
    return _next(op, t);
  })

  ops.push(false) // isComputed ?

  // TODO bad design, this shouldn't be here, should be gathered for every nodes.
  // Detect every upwards dependencies, then process them with the types constructor.
  var upwards = t.deps.filter(h.customFinder({to: node.id, type: "Assignment"}));
  if (upwards.length > 1) throw errors.multipleOccurences(upwards);

  console.log(t.deps);

  if (upwards.length > 0) { // There is an assignement
    var _node = t.nodes.find(function(node) {
      return node.id === upwards.id;
    })

    return b.assignmentExpression(upwards.operator, b.memberExpression.apply(this, ops), _next(_node, t) )
  } else {
    return b.memberExpression.apply(this, ops);
  }

}

//   functionExpression(name, args, body, isGenerator, isExpression[, loc])
// TODO

//   arrayExpression(elts[, loc])
// TODO

//   objectExpression(props[, loc])
// TODO

//   thisExpression([loc])
_types.ThisExpression = function(n, t) {
  return b.thisExpression();
}

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
_types.Identifier = function(n, t) {
  return b.identifier(n.name);
}

//   literal(val[, loc])
_types.Literal = function(n, t) {
  var lit = b.literal(n.name);
  return lit;
}

//   property(kind, key, val[, loc])
// TODO
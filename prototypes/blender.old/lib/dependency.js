module.exports = {
	walk: walk,
  types: _types,
  hash: _hash,
  builders: {
    node: _Node,
    dep: _Dep
  }
}

var _scopes = [];
var _c = [];
var __salt = 1000;

function _next(n, c) {
  if (!n.type) {
    console.log("    Oups, no type : ", n);
    return false;
  }

  // console.log(_pre(c) + n.type);
  if (!_types[n.type]) {

    console.log(n);

    throw "ERROR : " + n.type + " handler not implemented"
  }

  return _types[n.type](n, c);
}

function walk(ast) {

  _next(ast.program, _c);
  return _scopes;
}

/****************************************
  HELPERS
 ****************************************/

function _pre(c) {
  var _output = "";
  for (var i = 0; i < c.length; i++) {
    _output += "  ";
  };
  return _output + ">> ";
}

function _hash(n, salt) {
  return "" +
    n.loc.start.line +
    n.loc.start.column +
    n.loc.end.line +
    n.loc.end.column +
    "-" +
    (salt || _salt());
}

function _salt() {
  // return Math.floor(Math.random() * 10000);
  return __salt++;
}

function _id(o) {
  if (typeof o === "string") 
    return o;
  else
    return o.id;
}

function _name(o) {
  if (typeof o === "string") 
    return o;
  else
    return o.name;
}

/****************************************
  CONSTRUCTORS
 ****************************************/

function _Context(name, id, _arguments) {
  return {
    name: name,
    id: id,
    arguments: _arguments,
    // this: _this,
    deps: [],
    nodes: []
  }
}

function _Node(node, name, id, kind) {
	function inspect() {
		return this.name + "(" + this.id + ")[" + this.kind + "]" + (this.version ? ("[" + this.version + "]") : "");
	}

  if (name.id) {
    id = name.id;
    name = name.name;
  }

	return {
		name: name,
		id: id,
    ref: node,
    kind: kind,
		inspect: inspect,
		toString: inspect
	}
}

function _Dep(id, to, type) {

  function inspect() {
    return this.id + " ⇢  " + this.to + "[" + this.type + "]";
  }

  return {
    id: id,
    to: to,
    type: type,
    toString: inspect,
    inspect: inspect
  }
}

/****************************************
  TYPES
 ****************************************/

var _types = {};

_types.Identifier = function(n, c) {

	var ids = [];

  c.every(function(_c) {
    return _c.nodes.every(function(_id) {
      if (_id.name === n.name) {
        ids.push(_id);
      }
      return true;
    })
  })

	if (ids.length === 1) {
		return ids[0];
	}	else if (ids.length === 0){
    var node = new _Node(n, n.name, _hash(n), "Identifier");
    // c[0].nodes.push(node);
    return node;
	} else if (ids.every(function(id) {
        if (id.kind === "VariableDeclarator") {
          return true;
        }
        return false;
      })) {

      var max = 0
      var max_id;
      ids.forEach(function(id) {
        if (id.version > max) {
          max_id = id;
          max = id.version;
        }
      })

      return max_id;

    // TODO I am really not sure this version control for variable is bulletproof

		// console.log(ids, c);
		// throw ("CONFLICT " + ids.toString());
	} else {
    console.log(ids, c);
    throw ("CONFLICT " + ids.toString());
  }
}

_types.Literal = function(n, c) {
  var id = new _Node(n, n.value, _hash(n), "Literal");
  c[0].nodes.push(id);
	return id;
}

/****************************************
  PROGRAM
  - body
 ****************************************/

_types.Program = function(n, c) {

  var id = _hash(n);
  var previous = undefined;
  var current = undefined;

  c.unshift(new _Context(n.type, id));

  n.body.every(function(stt) {
    current = _next(stt, c);
    if (previous) {
      c[0].deps.push(new _Dep(_id(previous), _id(current), "Before"));
    }
    previous = current;
    return true;
  })

  _scopes[id] = c.shift();

  return _scopes;
}

/****************************************
  FUNCTION EXPRESSION
  FUNCTION DECLARATION
  - id
  - params []
  - defaults []
  - body
 ****************************************/

_types.Param = function(n, c) {
	return new _Node(n, _next(n, c), _hash(n), 'Param');
}

_types.FunctionExpression =
_types.FunctionDeclaration = function(n, c) {
	var next = _next(n.id, c);
  var hash = _hash(n);
  var name = _name(next);

	var node = new _Node(n, name, hash, 'FunctionDeclaration');
  c[0].nodes.push(node);

	var params = [];
  // Create Ids for every params
  n.params.every(function(param) {
    params.push(_types.Param(param, c));
    return true;
  })

  c.unshift(new _Context(node.name, node.id, params));
  params.every(function(param) {
    c[0].nodes.push(param);
    return true;
  })

  _next(n.body, c);

  // _scopes.push(c.shift());
  _scopes[hash] = c.shift();

  return node;
}

/****************************************
  VARIABLE DECLARATION
  - declarations []
  - kind
 ****************************************/

_types.VariableDeclaration = function(n, c) {

  var previous = undefined;
  var current = undefined;

  n.declarations.every(function(declaration) {
    current = _next(declaration, c);
    if (previous) {
      c[0].deps.push(new _Dep(_id(previous), _id(current), "Before"));
    }
    previous = current;
    return true;
  });

  return current;
}

/****************************************
  VARIABLE DECLARATOR
  - id
  - init
 ****************************************/

_types.VariableDeclarator = function(n, c) {
  var id = _next(n.id, c);
  var hash = _hash(n);
  var next = _next(n.init, c)

  var node = new _Node(n, id, hash, 'VariableDeclarator');
  var dep = new _Dep(_id(next), _id(node), 'VariableDeclarator');

  c[0].nodes.push(node);
  c[0].deps.push(dep);

  return node;
}

/****************************************
  CALL EXPRESSION
  - callee
  - arguments
 ****************************************/

_types.Argument = function(n, c) {
  var node = _next(n, c)
  return new _Node(n, node.name, node.id, 'Param');
}

_types.CallExpression = function(n, c) {
  var salt = _salt();
  var hash = _hash(n, salt);
  var next = _next(n.callee, c);
  var node = new _Node(n, _name(next), hash, "CallExpression")
  var i = 0;

  c[0].deps.push(new _Dep(_id(next), hash, "Callee"));
  c[0].nodes.push(node);
  c[0].nodes.push(next);

  n.arguments.every(function(argument) {
    var next = _types.Argument(argument, c);
    var dep = new _Dep(_id(next), hash, "Argument");
    dep.index = i++;

    c[0].deps.push(dep);
    
    return true;
  });

  return node;
}

/****************************************
  BLOCK STATEMENT
  - body []
 ****************************************/

_types.BlockStatement = function(n, c) {

  var previous = undefined;
  var current = undefined;

  n.body.every(function(stt) {
    current = _next(stt, c);
    if(previous) {
      c[0].deps.push(new _Dep(_id(previous), _id(current), "Before"));
    }
    previous = current;
    return true;
  })

  return current;
}

/****************************************
  RETURN STATEMENT
  - argument
 ****************************************/

_types.ReturnStatement = function(n, c) {

  var hash = _hash(n);

  var next = _next(n.argument, c);

  // TODO
  console.log(next);
  throw "TODO"

  var id = new _Node(n, 'return', hash, "ReturnStatement");
  var node = new _Dep(next, hash);

  c[0].deps.push(node);
  c[0].nodes.push(id);


  return id;
}

/****************************************
  BINARY EXPRESSION
  - operator
  - left
  - right
 ****************************************/

_types.BinaryExpression = function(n, c) {
	var name = n.operator;
	var hash = _hash(n);
  var node = new _Node(n, name, hash, "BinaryExpression");

  node.operator = n.operator;

  ['right', 'left'].forEach(function(op) {    
    var _node = _next(n[op], c);

    if (_node.kind === "Identifier") {
      c[0].nodes.push(_node);
    }
    var _dep = new _Dep(_node.id, hash, "BinaryExpression")
    _dep.side = op;
    c[0].deps.push(_dep);
  })

  c[0].nodes.push(node);

  return node;
}

/****************************************
  OBJECT EXPRESSION
  - properties
 ****************************************/

_types.ObjectExpression = function(n, c) {

  n.properties.every(function(property) {
    _next(n.property, c);
    return true;
  })

  // TODO

  return "ObjectLiteral";
}

/****************************************
  MEMBER EXPRESSION
  - properties
 ****************************************/

_types.MemberExpression = function(n, c) {
  var hash = _hash(n);
  var node = new _Node(n, "__name__", hash, "MemberExpression");

  var _ops = ["object", "property"] // TODO
  _ops.every(function(op) {
    var _node = _next(n[op], c);
    node[op] = _node;

    if (_node.kind === "Identifier") {
      c[0].nodes.push(_node);
    }
    var dep = new _Dep(_id(_node), hash, op)
    dep.computed = n.computed; // TODO computation dependencies
    c[0].deps.push(dep);
    return true;
  })

  if (n.computed) {
    node.name = _name(node.object) + "[" + _name(node.property) + "]";
  } else {
    node.name = _name(node.object) + "." + _name(node.property);
  }

  c[0].nodes.push(node);

  return  node;
}

/****************************************
  EXPRESSION STATEMENT
  - expression
 ****************************************/

_types.ExpressionStatement = function(n, c) {
  return _next(n.expression, c);
}

/****************************************
  ASSIGNEMENT EXPRESSION
  - expression
 ****************************************/

_types.AssignmentExpression = function(n, c) {
  var name = n.operator;
  // var hash = _hash(n);
  // var id = new _Node(n, name, hash, "AssignmentExpression");

  var ops = ['right', 'left'];
  ops.forEach(function(op, index) {    
    var node = ops[index] = _next(n[op], c);

    if (node.kind === "Identifier") {
      c[0].nodes.push(node);
    }

    if (op === "left" && node.kind === "VariableDeclarator") {
      var _node = ops[index] = new _Node(n[op], node.name, _hash(n), "VariableDeclarator");
      _node.version = node.version + 1 || 1;
      // var _dep = new _Dep(node.id, _node.id, "version"); // TODO add this again, commented just to simplify
      // c[0].deps.push(_dep);
      c[0].nodes.push(_node);

      // console.log(_node);
      // console.log(_dep);
    }
  })

  var _dep = new _Dep(_id(ops[0]), _id(ops[1]), "Assignment" );
  _dep.operator = n.operator;
  c[0].deps.push(_dep);

  return ops[1];
}


/****************************************
  LOGICAL EXPRESSION
  - expression
 ****************************************/

_types.LogicalExpression = function(n, c) {
  var name = n.operator;
  var hash = _hash(n);
  var id = new _Node(n, name, hash, "LogicalExpression");

  ['left', 'right'].every(function(op) {    
    var _node = _next(n[op], c);

    // TODO
    // console.log(next)
    // throw "TODO" 

    var _dep = new _Dep(_node.id, hash, n[op]);
    // var _node = new _Node(n, name, _hash(op), "Assign");

    c[0].deps.push(_dep);

    if (_node.kind === "Identifier") {
      c[0].nodes.push(_node);
    }

    return true;
  })

  return id;
}

/****************************************
  UPDATE EXPRESSION
  - expression
 ****************************************/






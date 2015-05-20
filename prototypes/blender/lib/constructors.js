var graphviz = require('./graphviz');
var path = require('./path');

module.exports = {
  DepBuilder: DepBuilder,
  MultiContext: MultiContext,
  Context: Context,
  Node: Node,
  Dep: Dep
}

function DepBuilder() {
  var scopes = new MultiContext();
  var stack = new Stack();

  stack.popContext = function() {
    var c = stack.shift();
    scopes[c.id] = c;
    return scopes;
  }

  return stack;
}

function Stack() {
  var _c = [];

  _c.toString = graphviz.toString;

  _c.pushDep = function(d) {
    _c[0].deps.push(d);
    return d;
  }

  _c.pushNode = function(n) {
    _c[0].nodes.push(n);
    return n;
  }

  _c.pushContext = function(c) {
    return _c.unshift(c);
  }

  _c.popContext = function() {
    return _c.shift();
  }

  return _c;
}

function MultiContext() {
  var _scopes = [];
  _scopes.toString = graphviz.toString;

  return _scopes;
}

function Context(name, id, _arguments, options) {

  var _c = {
    toString: graphviz.toString,
    path: path.find,
    name: name,
    id: id,
    arguments: _arguments,
    deps: [],
    nodes: []
  }

  if (options) {
    for (var i in options) { var option = options[i];
      _node[i] = option;
    }
  }

  return _c
}

function Node(node, name, id, kind, options) {
	function inspect() {
		return this.name + "(" + this.id + ")[" + this.kind + "]" + (this.version ? ("[" + this.version + "]") : "");
	}

  if (name.id) {
    id = name.id;
    name = name.name;
  }

	var _node = {
		name: name,
		id: id,
    ref: node,
    kind: kind,
		inspect: inspect,
		toString: inspect
	}

  if (options) {
    for (var i in options) { var option = options[i];
      _node[i] = option;
    }
  }

  return _node;
}

function Dep(id, to, type, options) {

  function inspect() {
    return this.id + " ⇢  " + this.to + "[" + this.type + "]";
  }

  var _dep = {
    id: id,
    to: to,
    type: type,
    toString: inspect,
    inspect: inspect
  }

  if (options) {
    for (var i in options) { var option = options[i];
      _dep[i] = option;
    }
  }

  return _dep;
}
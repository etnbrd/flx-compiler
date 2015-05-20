var util = require('util');

if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        if (i in list) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return value;
          }
        }
      }
      return undefined;
    }
  });
}

function _clone(obj) {
  var copy = util._extend({}, obj);
  return copy;
}

function convert(tree) {

	_n = {};
	_d = {};
	_t = {};

	tree.nodes.every(function(node) {
		_n[node.id] = _clone(node);
		return true
	})

	tree.deps.every(function(dep) {

		_dep = _clone(dep);


		_d[_dep.id] = _d[_dep.id] || [];
		_t[_dep.to] = _t[_dep.to] || [];

		_d[_dep.id].push(_dep);
		_t[_dep.to].push(_dep);

		_dep.id = _n[_dep.id];
		_dep.to = _n[_dep.to];
		
		return true;
	})

	return {
		name: tree.name,
		id: tree.id,
		nodes: _n,
		deps: _d,
		tos: _t
	}
}

module.exports = {
	convert: convert
}
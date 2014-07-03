var _types = {};

_types.Identifier = {
  enter: function(n, c) {
    c.id += (c.id === "" ? "" : ".") + n.name;
  }
}

module.exports = _types;

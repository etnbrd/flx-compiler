var iteratorFactory = require('../lib/iterators');

var _types = {};

// TODO refactor that, a member expression can be composed of other stuff than identifier. Literal and function to cite only that


_types.Identifier = {
  enter: function (n, p, c) {
    c.ids.push(n.name);
    if (p && p.computed)
      c.computed = true;
  }
};

module.exports = iteratorFactory(_types);

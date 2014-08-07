var iteratorFactory = require('../lib/iterators');

var _types = {};

_types.Identifier = {
    enter: function (n, p, c) {
        c.ids.push(n.name);
    }
};

module.exports = iteratorFactory(_types);

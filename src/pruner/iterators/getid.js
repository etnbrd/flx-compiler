var iteratorFactory = require('../../lib/iterators');

var _types = {};

_types.Identifier = {
    enter: function (c, n) {
        c.id += (c.id === '' ? '' : '.') + n.name;
    }
};

module.exports = iteratorFactory(_types);

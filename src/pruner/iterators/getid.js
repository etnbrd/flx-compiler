module.exports = iterator;

function iterator(c) { // TODO refactor to extract this function from the defeinition of _types, and then dynamically generate iterator modules.
    function handlerFactory(type) {
        return function handler(n, p) {
            if (!n.type)
                throw errors.missingType(n);
            if (!!_types[n.type] && _types[n.type][type])
                return _types[n.type][type](n, p, c);
        };
    }

    return {
        enter: handlerFactory('enter'),
        leave: handlerFactory('leave')
    };
};

var _types = {};

_types.Identifier = {
    enter: function (n, p, c) {
        c.id += (c.id === '' ? '' : '.') + n.name;
    }
};
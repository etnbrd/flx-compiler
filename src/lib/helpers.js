var _salt = 1000;

// function _pre(c) {
//   var _output = '';
//   for (var i = 0; i < c.length; i++) {
//     _output += '  ';
//   };
//   return _output + '>> ';
// }

function salt() {
    return _salt++;
}

function hash(n, _salt) {
    return '' +
        n.loc.start.line +
        n.loc.start.column +
        n.loc.end.line +
        n.loc.end.column +
        '-' +
        (_salt || salt());
}

function extractSalt(id) {
    return id.split('-').splice(1).join('-');
}

function idFinder(id) {
    return function(_node) {
        if (id === _node.id)
            return _node;
    };
}

function toFinder(id) {
    return function(_node) {
        if (id === _node.to)
            return _node;
    };
}

function nameFinder(id) {
    return function(_node) {
        if (id === _node.name)
            return _node;
    };
}

function customFinder(obj) {
    return function(_node) {
        for (var i in obj) {
            if (_node[i] !== obj[i])
                return false;
        }
        return _node;
    };
}

module.exports = {
    hash: hash,
    salt: salt,
    extractSalt: extractSalt,
    idFinder: idFinder,
    toFinder: toFinder,
    nameFinder: nameFinder,
    customFinder: customFinder
};

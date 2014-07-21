var _saltTrace = 1000;

function salt() {
    return _saltTrace++;
}

function hash(node, _salt) {
    return '' +
        node.loc.start.line +
        node.loc.start.column +
        node.loc.end.line +
        node.loc.end.column +
        '-' +
        (_salt || salt());
}

module.exports = {
    hash: hash,
    salt: salt
};

var parse = require('recast').parse;
var prune = require('./pruner');
var link = require('./linker');

module.exports = function (code) {
    return link(prune(parse(code)));
};

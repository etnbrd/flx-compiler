var _print = require('recast').print,
    bld = require('./builders'),
    map = require('../lib/traverse').map,
    iterator = require('../lib/traverse').iterator(require('./iterators/main'));

function print(ast) {
    return _print(ast).code;
}

function printSig(flx) {
    return flx.outputs.map(function (o) {
            return o.name + ' [' + Object.keys(o.signature) + ']';
        }).join(', ');
}

function link(ctx) {
    var index,
        ast,
        code,
        flx,
        length = ctx._flx.length,
        _code;

    // Add the flx library
    ctx.ast.program.body.unshift(bld.requireflx());
    ast = map(ctx._flx.Main.ast, iterator());

    code = print(ast);

    for (index = 0; index < length; index++) {
        flx = ctx._flx[index];
        if (flx.name !== 'Main') {

            _code = print(bld.register(flx.name, map(flx.ast, iterator()), flx.scope));

            // This is only the comment :
            code += "\n\n// " + flx.name + ' >> ';
            if (flx.outputs.length) {
                code += printSig(flx);
            }
            else {
                code += 'ø';
            }

            code += "\n\n" + _code;
        }
    }

    return code;
}

module.exports = link;

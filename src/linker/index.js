var _print = require('recast').print,
    bld = require('./builders'),
    map = require('../lib/traverse').map,
    iterator = require('../lib/traverse').iterator(require('./iterators/main'));

function print(ast) {
    return _print(ast).code;
}

function printFlx(flx) {
    if (flx.outputs.length) {
        return flx.outputs.map(function (o) {
            return o.name + ' [' + Object.keys(o.signature) + ']';
        }).join(', ');
    }
    else {
        return 'ø';
    }
}

function link(ctx) {

    // Add the flx library
    ctx.ast.program.body.unshift(bld.requireflx());
    var ast = map(ctx._flx.Main.ast, iterator());

    var code = print(ast);

    for (var _flx in ctx._flx) {
        var flx = ctx._flx[_flx];
        if (flx.name !== 'Main') {
            var _code = print(bld.register(flx.name, map(flx.ast, iterator()), flx.scope));

            // This is only the comment :
            code += '\n\n// ' + flx.name + ' >> ' + printFlx(flx) + '\n\n' + _code;
        }
    }

    return code;
}

module.exports = link;

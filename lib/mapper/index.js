var map = require('./iterator'),
    MapContext = require('./context'),

    estraverse = require('estraverse');

module.exports = function(ctx) {

    var ctx = new MapContext(ctx);
    estraverse.traverse(ctx.ast, map(ctx));
    ctx.end();

    return ctx;
};
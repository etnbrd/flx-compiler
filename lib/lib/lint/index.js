require('coffee-script/register');

var globals = require('./globals.coffee'),
    flx = require('./flx.coffee');

function lint(code) {
    return flx(code, globals);
}

module.exports = {
    flx: flx,
    globals: globals,
    lint: lint
};

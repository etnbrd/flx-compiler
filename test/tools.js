require('coffee-script/register');
var fs = require('fs'),
    t = require('../src/lib/tools'),
    compile = require('../src/compile'),
    lint = require('./lint.coffee'),
    assert = require('assert');

function read(filename) {
    return fs.readFileSync('./examples/' + filename).toString();
}

function compileAndLoad(filename) {
    var src = compile(read(filename));
    var l = lint(src);
    if (l.length)
        assert.fail(false, true, 'Des variables globales sont référencez dans des fluxions :\n' + JSON.stringify(l, null, '\t'));
    t.writeFile(filename, src, __dirname + '/../results/');
    return require(__dirname + '/../results/' + filename).app;
}

function compileAndMock(filename) {
    return require('supertest')(compileAndLoad(filename));
}

module.exports = {
    compile: compile,
    read: read,
    compileAndMock: compileAndMock,
    compileAndLoad: compileAndLoad
};

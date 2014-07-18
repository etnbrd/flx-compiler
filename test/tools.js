var fs = require('fs'),
    t = require('../src/lib/tools'),
    _compile = require('../src/compile'),
    lint = require('../src/lib/lint').lint,
    assert = require('assert');

// TODO refactor needed !!

function read(filename) {
    return fs.readFileSync('./examples/' + filename).toString();
}

function compile(src, filename) {
    var res = _compile(src, filename).toJs();
    t.writeFile(filename, res, __dirname + '/../results/');
    return res;
}

function compileAndLoad(filename) {
    var src = _compile(read(filename), filename).toJs();
    t.writeFile(filename, src, __dirname + '/../results/');
    var l = lint(src);
    if (l.length)
        assert.fail(false, true, 'Des variables globales sont référencez dans des fluxions :\n' + JSON.stringify(l, null, '\t'));
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

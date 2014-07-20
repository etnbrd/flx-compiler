var fs = require('fs'),
    t = require('../lib/lib/tools'),
    _compile = require('../lib'),
    lint = require('../lib/lib/lint').lint,
    assert = require('assert');

// TODO refactor needed !!

function read(filename) {
    return fs.readFileSync('./examples/' + filename).toString();
}

function compile(src, filename) {
    var res = _compile(src, filename);
    t.writeFile(filename, res.toJs(), __dirname + '/../results/');
    t.writeFile(filename.replace('.js', '.flx'), res.toFlx(), __dirname + '/../results/');
    return res;
}

function compileAndLoad(filename) {
    var src = compile(read(filename), filename).toJs();
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
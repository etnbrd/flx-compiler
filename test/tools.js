var fs = require('fs'),
    pth = require('path'),
    t = require('../lib/lib/tools'),
    _compile = require('../lib'),
    lint = require('../lib/lib/lint').lint,
    assert = require('assert');

function read(filename) {
    return fs.readFileSync('./examples/' + filename).toString();
}

function compile(src, filename, dirname) {
    var res = _compile(src, filename, dirname);


    res.toJs().forEach(function(file) {
        t.writeFile(file.filename, file.code, __dirname + '/../results/' + file.dirname);
    })

    // TODO same with flx.
    t.writeFile(filename.replace('.js', '.flx'), res.toFlx(), __dirname + '/../results/');
    return res;
}

function compileAndLoad(filename) {

    var dirname = pth.dirname(filename);
    filename = pth.basename(filename);

    console.log(dirname, filename);

    var src = compile(read(filename), filename, dirname).toJs();
    var l = lint(src);
    if (l.length)
        assert.fail(false, true, 'Des variables globales sont référencées dans des fluxions :\n' + JSON.stringify(l, null, '\t'));
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

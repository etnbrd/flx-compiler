var fs = require('fs'),
    t = require('../src/lib/tools'),
    _compile = require('../src/compile');


// TODO refactor needed !!


function read(filename) {
    return fs.readFileSync('./examples/' + filename).toString();
}

function expect(filename) {
    return fs.readFileSync('./test/results/' + filename).toString();
}

function compile(src, filename) {
    var res = _compile(src);
    t.writeFile(filename, res, __dirname + '/../results/');
    return res;
}

function compileAndLoad(filename) {
    compile(read(filename), filename);
    return require(__dirname + '/../results/' + filename).app;
}

function compileAndMock(filename) {
    return require('supertest')(compileAndLoad(filename));
}

module.exports = {
    compile: compile,
    read: read,
    expect: expect,
    compileAndMock: compileAndMock,
    compileAndLoad: compileAndLoad
};
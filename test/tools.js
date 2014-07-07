var fs = require('fs'),
    t = require('../src/lib/tools'),
    compile = require('../src/compile');

function read(filename) {
    return fs.readFileSync('./examples/' + filename).toString();
}

function compileAndLoad(filename) {
    t.writeFile(filename, compile(read(filename)), __dirname + '/../results/');
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

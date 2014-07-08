var fs = require('fs'),
    t = require('../src/lib/tools'),
    compile = require('../src/compile');

function read(filename) {
    return fs.readFileSync('./examples/' + filename).toString();
}

function compileAndLoad(filename) {

    var src = compile(read(filename))

    t.writeFile(filename, src, __dirname + '/../results/');
    // console.log(filename, src)
    var req = require(__dirname + '/../results/' + filename);
    req.app.settings.name = filename;
    return req.app;
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
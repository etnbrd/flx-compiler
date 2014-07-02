var fs = require('fs')
,   request = require('supertest')
,   t = require('../src/lib/tools')
,   compile = require('../src/compile');

module.exports = {
    compileAndMock: compileAndMock
} 

function compileAndMock(filename) {
  var res = compile(fs.readFileSync("./examples/" + filename).toString());
  t.writeFile(filename, res, "./results/");
  return request.agent(require("../results/" + filename).app);
}

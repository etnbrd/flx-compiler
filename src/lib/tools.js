var fs = require("fs")
,   util = require("util")
,   map = require('../lib/traverse').map
;

module.exports = {
    writeFile: writeFile
,   clone: clone
}

function writeFile(name, data, path) {
  var path = (path || "") + name;

  if (process.env.verbose)
  	process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m ' + path);
  
  fs.writeFileSync(path, data);

  if (process.env.verbose)
  	console.log('  \x1B[1m\x1B[32m✓\x1B[39m\x1B[22m');
}

function clone(obj) {
  var copy = util._extend({}, obj);
  return copy;
}
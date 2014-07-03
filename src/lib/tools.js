var fs = require("fs")
,   util = require("util")
,   map = require('../lib/traverse').map
;

module.exports = {
    writeFile: writeFile
,   clone: clone
,   commonMapper: commonMapper
,   commonIterator: commonIterator
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

function commonIterator(c, types) {
    types = types || _types;
    function handle(type) {
        return function(n) {
          if (!n.type)
            throw errors.missingType(n);

            if (!!types[n.type] && types[n.type][type])
                return types[n.type][type](n, c);
        }
    }

    return {
        enter: handle('enter'),
        leave: handle('leave')
    }
}

function commonMapper(ast, c, types) {
    return map(ast, commonIterator(c, types))
}

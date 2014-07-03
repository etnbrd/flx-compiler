var fs = require('fs')
,   parse = require('recast').parse
,   map = require('./index').map
;

function compile(filename) {
  return parse(fs.readFileSync('./examples/' + filename).toString()).program;
}

var ast = compile('ifthen.js');

function handle(type) {
    return function(n) {
      if (!n.type)
        throw errors.missingType(n);

        if (!!_types[n.type] && _types[n.type][type])
            return _types[n.type][type](n);
    }
}

var mres = map(ast, {
    enter: handle('enter'),
    leave: handle('leave')
})

console.log(ast);
console.log(mres);

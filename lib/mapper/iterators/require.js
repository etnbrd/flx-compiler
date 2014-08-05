var esprima = require('esprima'),
    estraverse = require('estraverse'),
    fs = require('fs');
    iteratorFactory = require('../../lib/iterators'),
    getIdIterator = require('./getid');

var _types = {};

_types.CallExpression = {
  enter: function (n, p, c) {
    // TODO this is bad design
    var _c = {ids: []};
    // TODO modify getIdIterator so that require('foo')(bar) doesn't understand the second call as a require call.
    estraverse.traverse(n.callee, getIdIterator(_c));

    // If a local file is required
    if (_c.ids[0] === 'require' && n.arguments.length > 0 && n.arguments[0].value && n.arguments[0].value[0] === '.') {

      var filename = n.arguments[0].value.split('/').pop(),
          // dirname = c.dirname + '/' + n.arguments[0].value.split('/').slice(0, 1).join('/');
          dirname = process.cwd() + '/' + n.arguments[0].value.split('/').slice(0, -1).join('/'),
          filepath = dirname + '/' + filename, // TODO need to normalize filepath to be able to cache modules.
          module = {
        pre:  '(function (exports, require, module, __filename, __dirname) {', // TODO, THIS IS PLAIN WRONG, this function should return something to initialize the variable, it does NOT.
        post: '}).apply(module.exports, [module.exports, require, module, \'' + filename + '\', \'' + dirname + '\']) ? module.exports : module.exports;' // TODO haha, lol :)
      };

      if (fs.existsSync(filepath)) {
        if (fs.lstatSync(filepath).isDirectory() && fs.existsSync(filepath + '/index.js')) {
          filepath += '/index.js';
        }
      } else {
        if (filename.lastIndexOf('.js') !== filename.length - 3 && fs.existsSync(filepath + '.js')) {
          filename = filename + '.js';
          filepath = dirname + '/' + filename;
        }
      }

      if (fs.existsSync(filepath)) {

        console.log(filepath)

        var ast = esprima.parse(module.pre + fs.readFileSync(filepath).toString() + module.post);
        if (p.type === "VariableDeclarator") { // Most of the requires are VariableDeclarator, still TODO fix this for other cases (probably callee of CallExpression).
          p.init = ast.body[0].expression;
        }
      }
    }
  }
}

module.exports = iteratorFactory(_types);
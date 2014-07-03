/*
  Simply adding a file to this directory make it accessible through require('./iterators').my_file_name
*/

var errors = require("../../lib/errors");

module.exports = require('fs').readdirSync(__dirname).reduce(function (module, file) {
  if (file !== 'index.js') {
    module[file.split(".")[0]] = {};
  }
  return module;
}, {});

// Dynamic module loading : we need to exports the skeleton of the module.exports early, and then populate it to avoid recursion problem.
Object.keys(module.exports).forEach(function(name) {
  module.exports[name] = iteratorFactory(require(__dirname + '/' + name));
})

function iteratorFactory(types) {  
  return function iterator(c) {
    function handlerFactory(type) {
      return function handler(n) {
        if (!n.type)
          throw errors.missingType(n);

        if (!!types[n.type] && types[n.type][type])
            return types[n.type][type](n, c);
      }
    }

    return {
      enter: handlerFactory('enter'),
      leave: handlerFactory('leave')
    }
  }
}
/*
  Simply adding a file to this directory make it accessible through require('./iterators').my_file_name
*/

module.exports = require('fs').readdirSync(__dirname).reduce(function (module, file) {
  if (file !== 'index.js') {
    module[file.split(".")[0]] = {};
  }
  return module;
}, {});

// Dynamic module loading : we need to exports the skeleton of the module.exports early, and then populate it to avoid recursion problem.
Object.keys(module.exports).forEach(function(name) {
  module.exports[name] = require(__dirname + '/' + name)
})
var fs = require('fs'),
    util = require('util');

function writeFile(name, data, path) {
    var wPath = (path || '') + name;

    if (process.env.verbose)
        process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m ' + wPath);

    fs.writeFileSync(wPath, data);

    if (process.env.verbose)
        console.log('  \x1B[1m\x1B[32m✓\x1B[39m\x1B[22m');
}

function clone(obj) {
    var copy = util._extend({}, obj);
    return copy;
}

module.exports = {
    writeFile: writeFile,
    clone: clone
};

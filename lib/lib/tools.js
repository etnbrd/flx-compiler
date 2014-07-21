var fs = require('fs'),
    util = require('util');

function writeFile(fileName, content, fileDirectory) {
    var writePath = (fileDirectory || '') + fileName;

    if (process.env.verbose)
        process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m ' + writePath);

    fs.writeFileSync(writePath, content);

    if (process.env.verbose)
        console.log('  \x1B[1m\x1B[32m✓\x1B[39m\x1B[22m');
}

module.exports = {
    writeFile: writeFile
};

var PEG = require('pegjs');
var fs = require('fs');

process.stdout.write('Generating parser ');
var parser = PEG.buildParser('' + fs.readFileSync(__dirname + '/fluxion.peg'));
console.log(' ... done.');

var filename = process.argv[2];
if (!filename) {
    console.log('Please specify a filename as an argument');
    return 0;
}

var res = parser.parse('' + fs.readFileSync(filename));

console.log(res);

#!/usr/bin/env node

var parser = require('../lib/flx-parser'),
    fs = require('fs');

var filename = process.argv[2];
if (!filename) {
    console.log('Please specify a filename as an argument');
    return 0;
}

var file = fs.readFileSync(filename);

console.log(file.toString());

console.log('\n ---- \n');

var res = parser.parse('' + file);

console.log(require('util').inspect(res, false, 12));
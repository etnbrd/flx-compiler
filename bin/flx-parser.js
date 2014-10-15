#!/usr/bin/env node

var parser = require('../lib/flx-parser'),
    fs = require('fs');

var filename = process.argv[2];
if (!filename) {
    console.log('Please specify a filename as an argument');
    return 0;
}

var res = parser.parse('' + fs.readFileSync(filename));

console.log(require('util').inspect(res, false, 12));
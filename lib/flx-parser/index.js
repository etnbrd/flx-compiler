var PEG = require('pegjs'),
    fs = require('fs');

module.exports = PEG.buildParser('' + fs.readFileSync(__dirname + '/grammar.peg'));
var parse = require("recast").parse;
var transform = require("./lib/transform");
var link = require("./lib/link");

module.exports = function(code) {
	return link(transform(parse(code)));
}
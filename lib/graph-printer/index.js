var d3 = require('d3');
var graph = require('./graph');

 d3.layout.squarepack = require('./pack-layout.js');

module.exports = function(ctx) {
  var pre = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">';
  var post = '</svg>';

  return pre + graph(ctx) + post;
}
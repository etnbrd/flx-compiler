var graph = require('./graph');

module.exports = function(ctx, code) {
  var pre = '<html><head><style>'
          + '.identifier { color: blue; }'
          + '.reference { color: green; }'
          + '.ref { text-decoration: underline; }'
          + '.defs { background-color: yellow; }'
          + '.node { font: 10px sans-serif; }'
          + '.link { stroke: steelblue; stroke-opacity: .4; fill: none; }'
          + '</style></head><body>';
  var post = '</body></html>';

  return pre + graph(ctx, code) + post;
};

var graph = require('./graph');

module.exports = function(ctx, code) {
  var pre = '<html><head><style>'
          + '.identifier { color: blue; }'
          + '.reference { color: green; }'
          + '.ref { text-decoration: underline; }'
          + '.defs { background-color: yellow; }'
          + '</style></head><body><code><pre>';
  var post = '</pre></code></body></html>';

  return pre + graph(ctx, code) + post;
};

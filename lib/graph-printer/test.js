var printer = require('./index');

var mockCtx = JSON.parse(require('fs').readFileSync(__dirname + '/ctx-mock.json'));

var file = printer(mockCtx)

var pre = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">';
var post = '</svg>';

require('fs').writeFileSync(__dirname + '/output.svg', pre + file + post);
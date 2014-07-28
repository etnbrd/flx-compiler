var printer = require('./index');

var mockCtx = JSON.parse(require('fs').readFileSync(__dirname + '/ctx-mock.json'));

var file = printer(mockCtx);

require('fs').writeFileSync(__dirname + '/output.svg', file);
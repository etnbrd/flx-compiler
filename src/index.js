var compile = require("./compile");
var prompt = require("./lib/interface");

prompt.pipe(compile);
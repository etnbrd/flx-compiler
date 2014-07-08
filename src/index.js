var compile = require('./compile'),
    prompt = require('./lib/interface');

prompt.pipe(compile);

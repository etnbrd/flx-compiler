var compile = require('../lib'),
    prompt = require('./interface');

prompt.pipe(compile);

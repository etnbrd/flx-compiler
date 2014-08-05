#!/usr/bin/env node

var compile = require('../lib'),
    prompt = require('../lib/lib/interface');

prompt.pipe(compile);

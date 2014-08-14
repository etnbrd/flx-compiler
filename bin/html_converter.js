#!/usr/bin/env phantomjs

var args = require('system').args,
    page = require('webpage').create();

page.viewportSize = { width: 400, height: 450 };
page.open(args[1], function (status) {
  if (status !== 'success')
    console.log('Unable to load the address!');
  else
    page.render(args[2]);

  phantom.exit();
});

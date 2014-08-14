#!/usr/bin/env phantomjs

var args = require('system').args,
    page = require('webpage').create(),
    address, output;

address = args[1];
output = args[2];
console.log(address);
console.log(output);
page.viewportSize = { width: 800, height: 450 };
page.open(address, function (status) {
  if (status !== 'success')
    console.log('Unable to load the address!');
  else
    page.render(output);

  phantom.exit();
});

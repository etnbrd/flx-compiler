var counter = 0;

get(function server(request) {

  async(function() {
    handlers[request]();
    console.log(res);
  });

})

var handlers = {
  'prompt' : function prompter () {
    return counter;
  },
  'buy' : function buyer () {
    counter += 1;
    return counter;
  },
  'sell' : function seller () {
    counter -= 1;
    return counter;
  }
}

//////////////////////////////////////////////////////

function get(server) {
  // Simulate a client request
  setInterval(function () {
    server(client())
  }, 100);
}

function client() {
  if (Math.random() >= 0.5)
    return 'prompt';
  else if (Math.random() >= 0.5)
      return 'buy';
    else 
      return 'sell';
}

function async() {
  var args = Array.prototype.slice.call(arguments);
  var cb = args.pop();
  setTimeout(function() {
    cb.apply(this, args);
  }, 0);
}
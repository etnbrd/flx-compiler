var fs = require("fs");
var http = require("http");
var spawn = require('child_process').spawn;

var t = require("../src/lib/tools");
var compile = require("../src/compile");

module.exports = {
	compileFile: compileFile,
	server: server,
	client: client
} 

function compileFile(filename) {
  var res = compile(fs.readFileSync("./examples/" + filename).toString());
  t.writeFile(filename, res, "./results/");
}


function server(path, ondata) {
  child = spawn("node", ["./results/" + path]);
  child.stdout.on('data', ondata);

  return function(onclose) {
    child.on('close', function (code) {
      // console.log('child process exited with code ' + code);
      if (onclose)
        onclose();
    });
    
    child.stdin.pause();
    child.kill('SIGKILL');
  }
}

function client(ondata) {


  var options = {
    hostname: 'localhost',
    port: 8080,
    method: 'GET'
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(data) {
      ondata(data);
    });

  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });


  req.end();

}
var fs = require('fs');

function parseArgs(args) {


  function options() {
  
    function output(arg) {
      this.output = arg;
    }

    function verbose() { // TODO can't handle this flag for the moment, need refactoring
      this.verbose = true;
    }

    function first(arg) {
      this.input = arg;
    }

    const avaliableOptions = {
      '-o' : output,
      '--output' : output,
      '-v' : verbose,
      '--verbose' : verbose
    };

    function iterator(opt, arg) {
      var flagHandler = avaliableOptions[arg],
          prev;

      if (!prev && !flagHandler && !opt.input) {
        prev = first;
      }

      if (prev) {
        prev.call(opt, arg);
      }

      prev = flagHandler;

      return opt;
    }

    return iterator;
  }

  return args.slice(2).reduce(options(), {
    input: undefined,
    output: undefined,
    verbose: true // TODO fix the verbose flag
  });
}

function pipe(fn) {

  var options = parseArgs(process.argv);

  if (!options.input) {
    console.log('Please specify a name'); // TODO error management
  }

  // if (!options.output) {
    // options.output = 'result.js';
  // }

  if (options.verbose) {
    process.env.verbose = true;
  }

  fs.readFile(options.input, function(err, file) {
    if (err) throw err;

    var filename = options.input.split('/');
    filename = filename[filename.length - 1];

    var output = fn(file, filename);
    if (options.output) {
      fs.writeFile(options.output, output, function(err) {
        if (err) throw err;
      });
    } else {
      console.log("\n====================================\n");
      console.log(output);
    }
  });

}

module.exports = {
  args : parseArgs,
  pipe : pipe
};

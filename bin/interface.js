var fs = require('fs'),
    log = require('../lib/lib/log');

function parseArgs(args) {


  function options() {
  
    function javascript(arg) {
      this.jsOutput = arg;
    }

    function fluxion(arg) {
      this.flxOutput = arg;
    }

    function graph(arg) {
      this.gOutput = arg;
    }

    function verbose() { // TODO can't handle this flag for the moment, need refactoring
      this.verbose = true;
    }

    function first(arg) {
      this.input = arg;
    }

    const avaliableOptions = {
      '-j' : javascript,
      '--javascript' : javascript,
      '-f' : fluxion,
      '--fluxion' : fluxion,
      '-g' : graph, // TODO
      '--graph' : graph, // TODO
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

function pipe(compile) {

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

    var output = compile(file, filename);

    if (options.jsOutpout) {
      fs.writeFile(options.jsOutput, output.toJs(), function(err) {
        if (err) throw err;
      });
    } if (options.flxOutpout) {
      fs.writeFile(options.jsOutput, output.toFlx(), function(err) {
        if (err) throw err;
      });
    } /*if (options.gOutpout) {
      var output = compile.toJs(file, filename);
      fs.writeFile(options.jsOutput, output, function(err) {
        if (err) throw err;
      });
    } */else {
      var js = output.toJs();
      // var flx = output.toFlx();
      
      log.start('JAVASCRIPT MIDDLEWARE OUTPUT');
      log.code(js);

      // log.start('FLUXIONNAL OUTPUT');
      // log.code(flx);

    }
  });

}

module.exports = {
  args : parseArgs,
  pipe : pipe
};

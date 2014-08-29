var fs = require('fs'),
    log = require('./log'),
    pjson = require('../../package');

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

    var prev;

    function iterator(opt, arg) {
      var flagHandler = avaliableOptions[arg];

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

  if (options.verbose) {
    process.env.verbose = true;
  }

  fs.readFile(options.input, function(err, file) {
    if (err) throw err;

    var filename = options.input.split('/').pop(),
        dirname = options.input.split('/').slice(0, -1).join('/'),
        output = compile(file, filename, dirname);

    if (options.jsOutput) {
      output.toJs().forEach(function(file) {
        // TODO this is a quick fix, will break with multiple files projects
        fs.writeFile(file.dirname + options.jsOutput, file.code, function(err) {
          if (err) throw err;
        });
      });
    }

    if (options.flxOutput) {
      fs.writeFile(options.flxOutput, output.toFlx(), function(err) {
        if (err) throw err;
      });
    }

    if (options.gOutput) {
      fs.writeFile(options.gOutput, output.toGraph(), function(err) {
        if (err) throw err;
      });
    }

    if (!options.gOutput && !options.flxOutput && !options.jsOutput) {
      var js = output.toJs();
      // var flx = output.toFlx();
      
      log.start('JAVASCRIPT MIDDLEWARE OUTPUT');

      js.forEach(function(file) {
        log.code(file);
      })

      // log.start('FLUXIONNAL OUTPUT');
      // log.code(flx);

    }
  });

}

module.exports = {
  args : parseArgs,
  pipe : pipe
};

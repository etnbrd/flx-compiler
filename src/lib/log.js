var colorFactory = function(prefix, suffix) {
  var colorFn = function(string) {
    if (typeof(string) === 'function') {
      return function(string_) {
        return colorFn(string(string_));
      };
    }
    return prefix + string + suffix;
  };
  return colorFn;
};

var bold          = colorFactory('\x1B[1m', '\x1B[22m');
var italic        = colorFactory('\x1B[3m', '\x1B[23m');
var underline     = colorFactory('\x1B[4m', '\x1B[24m');
var inverse       = colorFactory('\x1B[7m', '\x1B[27m');
var strikethrough = colorFactory('\x1B[9m', '\x1B[29m');

var white         = colorFactory('\x1B[37m', '\x1B[39m');
var grey          = colorFactory('\x1B[90m', '\x1B[39m');
var black         = colorFactory('\x1B[30m', '\x1B[39m');

var blue          = colorFactory('\x1B[34m', '\x1B[39m');
var cyan          = colorFactory('\x1B[36m', '\x1B[39m');
var green         = colorFactory('\x1B[32m', '\x1B[39m');
var magenta       = colorFactory('\x1B[35m', '\x1B[39m');
var red           = colorFactory('\x1B[31m', '\x1B[39m');
var yellow        = colorFactory('\x1B[33m', '\x1B[39m');

var prefix = bold(grey(">> "));

var _indent = 0;

function log(prefix, suffix, inc) {
  return function() {

    if (! process.env.verbose) return;

    if (inc < 0) _indent += inc;
    for (var _p = "", i = _indent; i > 0; i--) {_p += "┊ "};
    if (inc > 0) _indent += inc;
    var args = [prefix + grey(_p) + suffix].concat(Array.prototype.slice.call(arguments, 0));
    console.log.apply(undefined, args);
  }
}

module.exports = {
  bold : bold,
  italic : italic,
  underline : underline,
  inverse : inverse,
  strikethrough : strikethrough,
  white : white,
  grey : grey,
  black : black,
  blue : blue,
  cyan : cyan,
  green : green,
  magenta : magenta,
  red : red,
  yellow : yellow,

  enter : log(bold(yellow(">>  ")), bold(yellow("+ ")), 1),
  leave : log(bold(yellow(">>  ")), bold(yellow("- ")), -1),
  error : log(bold(red(">>  ")), bold(red("   error")) + " : ", 0),
  use : log(bold(grey(">>  ")), cyan("   use"), 0),
  vard : log(bold(grey(">>  ")), green("   var"), 0),
  sig : log(bold(grey(">>  ")), blue("   sig"), 0),
  mod : log(bold(grey(">>  ")), magenta("   mod"), 0),
  info : log(bold(grey(">>  ")), "  ", 0)
}
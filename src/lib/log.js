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

const pre = '>> ';

function prefix(color) {
    return bold(color(pre));
}

var _indent = 0;

function log(prefix, suffix, inc) {
    return function() {
        if (!process.env.verbose)
            return;

        if (inc < 0)
            _indent += inc;

        for (var _p = '', i = _indent; i > 0; i--)
            _p += '┊ ';

        if (inc > 0)
            _indent += inc;

        var args = [prefix + grey(_p) + suffix]
                   .concat(Array.prototype.slice.call(arguments, 0));

        console.log.apply(undefined, args);
    };
}

function start() {
    if (!process.env.verbose)
        return;

    var args = Array.prototype.slice.call(arguments, 0);

    args.unshift('\x1B[34m\x1B[1m');
    args.push('\x1B[39m\x1B[22m');

    var underline = "";
    for (var i = args[1].length; i > 0; i--) {
        underline += "-";
    };

    console.log("");
    console.log.call(undefined, args.join(''));
    console.log('\x1B[34m\x1B[1m' + underline + '\x1B[39m\x1B[22m');
}

function code(code) {
    const indent = "";
    // TODO syntaxic coloration

    code = indent + code.replace(/\n/g, "\n" + indent);

    console.log(code);
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

    start : start,
    code  : code,
    enter : log(prefix(yellow),  bold(yellow('+ ')),               1),
    leave : log(prefix(yellow),  bold(yellow('- ')),               -1),
    error : log(prefix(red),     bold(red('   error')) + '   : ',  0),
    use   : log(prefix(grey),    cyan('   use'),                   0),
    vard  : log(prefix(grey),    green('   var'),                  0),
    sig   : log(prefix(grey),    blue('   sig'),                   0),
    mod   : log(prefix(grey),    magenta('   mod'),                0),
    info  : log(bold(grey(pre)), '',                               0),

    in : log(bold(green(pre)), ' in ',                           1),
    out: log('', '', -1),


};

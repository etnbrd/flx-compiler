var util = require('util');

module.exports = build

function _name(name) {
  return name.slice(0, name.indexOf('_'));
}

function _base(name) {
  return name.slice(0, name.indexOf('+'));
}

function _safe(name) {

  name = name.replace(/\+/g, '_');

  return name;
}

function build(tree) {


  _down = {};
  _up = {};

  // Build _up and _down dependency table
  for (var i = 0; i < tree.dep.length; i++) {

    // tree.dep[i].name = _safe(tree.dep[i].name);
    // tree.dep[i].to = _safe(tree.dep[i].to);

    _down[tree.dep[i].name] = _down[tree.dep[i].name] || [];
    _down[tree.dep[i].name].push(tree.dep[i].to);
    _down[tree.dep[i].to] = _down[tree.dep[i].to] || [];

    _up[tree.dep[i].to] = _up[tree.dep[i].to] || [];
    _up[tree.dep[i].to].push(tree.dep[i].name);
    _up[tree.dep[i].name] = _up[tree.dep[i].name] || [];
  };

  _ids = {};
  for (var i = 0; i < tree.ids.length; i++) {
    if (_ids[tree.ids[i].id]) {
      // throw "ERROR, conflict in ids : " + tree.ids[i].id; // TODO errors.js
    } else {
      _ids[tree.ids[i].id] = tree.ids[i]
    }
  };

  console.log("------------------");

  var _flx = [];

  _flx.push('var flx = require("./../fluxions/lib/flx");');

  // console.log(_down);
  // console.log(_up);

  for (var name in _down) {
    var id = _ids[name];
    var deps = _down[name] || [];

    // console.log(">> FLX " + name + " ⇢  " + deps.join(', '));

    var _output = "flx.register(\"" + name + "\", function(msg) {\n";

    if (deps.length > 0) {

      var names = name.split('$');
      var _deps = [];
      for (var i = 0; i < deps.length; i++) {
        _deps[i] = deps[i].split('$');
      };

      // console.log(names);

      // Checking Literals
      for (var j = 0; j < names.length; j++) {
        if (_ids[names[j]].kind === "Literal") {
          // console.log(_ids[names[j]]);
          _output += "  var L" + _safe(names[j]) + " = " + _ids[names[j]].name + ";\n";
          names[j] = "L" + _safe(names[j]);
        } else { // TODO WTF/SRSLY ?
          names[j] = "msg[\"" + names[j] + "\"]";
        }
      };

      // Checking operations
      for (var j = 0; j < _deps[0].length; j++) {
        // console.log("  >> ", deps[0][j]);
        if (_ids[_deps[0][j]].kind === "BinaryExpression") {
          _output += "  msg[\"" + _ids[_deps[0][j]].id + "\"] = " + names.shift() + " " + _ids[_deps[0][j]].name + " " + names.shift() + ";\n"



          // console.log("  > ", _ids[deps[0][j]].name );
        }
      };

    
      console.log(deps);

      _output += "  return flx.m([\"" + deps[0] + "\"], msg)\n";
    } else {
      _output += "  console.log(msg)\n  return undefined;\n";
    }
    _output += "});"
    _flx.push(_output);
  };


  // console.log(_flx.join('\n\n'));

  for (var name in _up) {
    console.log(name, _up[name].length);

    if(_up[name].length === 0) {
      _flx.push("flx.start(flx.m(\"" + name + "\", {}))");
    }
  }


  return _flx.join('\n\n');
}
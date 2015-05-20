/****************************************
  HELPERS
 ****************************************/

function _pre(c) {
  var _output = "";
  for (var i = 0; i < c.length; i++) {
    _output += "  ";
  };
  return _output + ">> ";
}

function _hash(n, salt) {
  return "" +
    n.loc.start.line +
    n.loc.start.column +
    n.loc.end.line +
    n.loc.end.column +
    "-" +
    (salt || _salt());
}

function _salt() {
  // return Math.floor(Math.random() * 10000);
  return __salt++;
}

function _id(o) {
  if (typeof o === "string") 
    return o;
  else
    return o.id;
}

function _name(o) {
  if (typeof o === "string") 
    return o;
  else
    return o.name;
}
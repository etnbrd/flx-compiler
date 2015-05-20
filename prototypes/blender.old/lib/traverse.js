function walk(o, cb) {

  function _walk_o (o) {
    // console.log(">> walking object");
    for (var i in o) {
      _walk(o[i]);
    }
  }

  function _walk_a (a) {
    // console.log(">> walking array");
    for (var i = 0; i < a.length; i++) {
      _walk(a[i]);
    };
  }
  
  function _walk(o) {
    if (!o)
      return;

    cb(o);

    // Array
    if (o.length && typeof o !== "string") {
      _walk_a(o);
    }
    // Object
    else if (o.toString() === "[object Object]") {
      _walk_o(o);
    } else {
      // console.log("---");
    }
  }

  return _walk(o);
}

module.exports = walk;
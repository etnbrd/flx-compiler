module.exports = {
  reduce: reduce
}

function reduce(tree) {

  // _down = {};
  // _up = {}

  // Build _up and _down dependency table
  // for (var i = 0; i < tree.dep.length; i++) {

  //  _down[tree.dep[i].name] = _down[tree.dep[i].name] || [];
  //  _down[tree.dep[i].name].push(tree.dep[i].to);

  //  _up[tree.dep[i].to] = _up[tree.dep[i].to] || [];
  //  _up[tree.dep[i].to].push(tree.dep[i].name);
  // };

  // Loop throw ups to find rdv branchment
  // for (var i in _up) {
  //  if (_up[i].length > 1) {
  //    console.log(">> " + i + " : ", _up[i]);
  //  }
  // };

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // Remove every Param and ReturnStatements, as they only abstract values                     //
  ///////////////////////////////////////////////////////////////////////////////////////////////

  var _dirty = false;
  do {
    _dirty = false;
    for (var i = 0; i < tree.ids.length; i++)
    if (tree.ids[i].kind === "Param"
    ||  tree.ids[i].kind === "ReturnStatement") {
      _dirty = true;
      // console.log(">> ", tree.ids[i]);

      var _up = [];
      var _down = [];

      for (var j = 0; j < tree.dep.length; j++) {
        if (tree.dep[j].name === tree.ids[i].id) {
          // console.log("   - ", tree.dep[j]);
          _down.push(j);
        }
      };
      for (var j = 0; j < tree.dep.length; j++) {
        if (tree.dep[j].to === tree.ids[i].id) {
          // console.log("   + ", tree.dep[j]);
          _up.push(j);
        }
      };

      // I don't really know if there is a chance this happen.
      if(_up.length !== 1 || _down.length !== 1)
        throw "ERROR : " + tree.ids[i] + " has multiple upward or downward dependencies, while its a Param or return statement";

      // TODO when we remove these dependencies, we should also remove the ids, but they still appear on the graphs.

      tree.dep[_up[0]].to = tree.dep[_down[0]].to;
      // delete tree.ids[i];
      tree.ids.splice(i, 1);
      // delete tree.dep[_down[0]];
      tree.dep.splice(_down[0], 1);
    }
  } while (_dirty);

  // console.log(_down, _up);





  ///////////////////////////////////////////////////////////////////////////////////////////////
  // Merge multiple upward dependencies                                                        //
  ///////////////////////////////////////////////////////////////////////////////////////////////

  // TODO We don't track the position of the different dependencies when merging, it's a problem when multiple merging
  var _branches = [];
  do {
    _dirty = false;
    for (var i = 0; i < tree.dep.length; i++) {
      for (var j = 0; j < tree.dep.length; j++) {
        if (i !== j && tree.dep[i].to === tree.dep[j].to) { // TODO what if there is more than two upcoming dependencies ?
          _dirty = true;

          var _name1 = tree.dep[i].names || tree.dep[i].name;
          var _name2 = tree.dep[j].names || tree.dep[j].name;

          tree.dep[i].names = [_name1, _name2];
          tree.dep[i].name = tree.dep[i].name + '$' + tree.dep[j].name;
          // The decrementation cancels the index shift caused when removing the element
          tree.dep.splice(j--, 1);

          for (var k = 0; k < tree.dep.length; k++) {
            for (var m = 0; m < tree.dep[i].names.length; m++) { var name = tree.dep[i].names[m];
              if (name === tree.dep[k].to) {
                tree.dep[k].index = m;
                tree.dep[k].to = tree.dep[i].name;
              }
            };
          };
        }
      };
    };
  } while(_dirty)

  return tree;
}





// function reduction(graphParts) {

//   // Detect if a node has multiple dependencies
//   var _branches = [];
//   var _dirty = false;
//   do {
//     _dirty = false;
//     for (var i = 0; i < graphParts.length; i++) {
//       for (var j = 0; j < graphParts.length; j++) {
//         if (i !== j && graphParts[i].to === graphParts[j].to) { // TODO what if there is more than two upcoming dependencies ?
//           _dirty = true;
//           graphParts[i].names = [graphParts[i].name, graphParts[j].name];
//           graphParts[i].name = graphParts[i].name + ',' + graphParts[j].name;
//           graphParts.splice(j, 1);

//           for (var k = 0; k < graphParts.length; k++) {
//             for (var m = 0; m < graphParts[i].names.length; m++) { var name = graphParts[i].names[m];
//               if (name === graphParts[k].to) {
//                 console.log(name + " === " + graphParts[k].to)
//                 graphParts[k].index = m;
//                 graphParts[k].to = graphParts[i].name;
//               }
//             };
//           };
//         }
//       };
//     };
//   } while(!_dirty)
// }
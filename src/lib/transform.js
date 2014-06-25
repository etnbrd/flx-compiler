var recast = require("recast");
var fs = require("fs");

var errors = require("./errors");
var cons = require("./constructors");
var h = require("./helpers");
var map = require("./traverse").map;
var red = require("./traverse").reduce;
var bld = require("./builders");

module.exports = start;

var _types = {};

function start(ast) {
  var context = new cons.Context(ast);
  context.enterFlx("Main", ast.program);
  map(ast.program, _iterator(context));
  context.leaveFlx();
  context.ast.program.body.unshift(bld.requireflx());
  return context;
}

// TODO make itarators modules.
// one iterator by special case like needs of ahead member-expression identifier.

function _iterator(c) {
  function handled(n) {
    if (!n.type)
      throw errors.missingType(n);

    return !!_types[n.type]
  }

  function _enter(n) {
    if (handled(n))
      return _types[n.type].enter(n, c);
  }

  function _leave(n) {
    if (handled(n))
      return _types[n.type].leave(n, c);
  }

  return {
    enter: _enter,
    leave: _leave
  }
}

function _getId(c) {

  function _enter(n) {
    if(n.type === "Identifier") {
      c.id += (c.id === "" ? "" : ".") + n.name;
    }
  }

  function _leave(n) {

  }

  function aggregate(prev, n) {

  }

  return {
    enter: _enter,
    leave: _leave
  }

}

var getId = {
  enter : function(n) {
    return n;
  },
  leave : function(n, res) {

  },
  aggregate : function(prev, n) {

    // if (!prev)
    //   return n;

    if (n.type === "MemberExpression") {
      if (n.computed) {
        return prev + "[";
      } else {
        return prev + ".";
      }
    }

    if (n.type === "Identifier") {
      return prev + n.name;
    }
  },
  init: {
    al: "",
    om: ""
  }
}


_types.Program = {
  enter: function(n, c) {
    // context.enterFlx("Main", n);
    c.enterScope("Program");
  },
  leave: function(n, c) {
    c.leaveScope();
    // c.leaveFlx();
  }
}

//   functionDeclaration(name, args, body, isGenerator, isExpression[, loc])
//   functionExpression(name, args, body, isGenerator, isExpression[, loc])
_types.FunctionDeclaration = {
  enter: function(n, c) {
    c.enterScope(n.id.name);
    n.params.forEach(function(param) {
      c.registerVar(param);
    })
  },
  leave: function(n, c) {
    c.leaveScope();
  }
};

_types.FunctionExpression = _types.FunctionDeclaration;

//   variableDeclarator(patt, init[, loc])
_types.VariableDeclarator = {
  enter: function(n, c) {
    c.registerVar(n);
  },
  leave: function(n, c) {
  }
}

//   callExpression(callee, args[, loc])
_types.CallExpression = {
  enter: function(n, c) {

    // TODO this is bad design
    var _c = {id: ""};
    map(n.callee, _getId(_c));


    if (_c.id === "require")
      if (n.arguments.length > 0 && n.arguments[0].value[0] === "." ) {

        var filename = n.arguments[0].value;

        if (filename.lastIndexOf(".js") !== filename.length - 3) {
          filename = filename + ".js";
        }


        var ast = recast.parse(fs.readFileSync(filename).toString());

        // TODO scope problem : a required file is not a new fluxion, only a new scope
        // OR fluxion Main is a special fluxion which is not a movable fluxion.
        c.enterScope(filename, true);
        map(ast.program, _iterator(c));
        c.leaveScope()
      }




    if (_c.id === "app.get") { // STARTERS
      n.arguments.forEach(function(_n, i) {
          if (_n.type === "FunctionExpression"
          || _n.type === "FunctionDeclaration") {
            var name = _n.id.name;

            c.enterFlx(name, _n, "start");
            map(_n, _iterator(c));
            c.leaveFlx();
            n._placeholder = {type: "Placeholder", name: name, kind: "start", index: i};
            n.arguments[i] = {type: "Placeholder", name: name, kind: "start", index: i};
          }
      })

    }
    
    // if (_c.id === "res.send") { // POSTERS
    //   var name = _c.id + "-" + h.salt();
    //   c.enterFlx(name, bld.postFlx(name, n), "post");
    //   c.enterScope(name);
    //   n._placeholder = {type: "Placeholder", name: name, kind: "post"};
    // }

  },
  leave: function(n, c) {
    if (n._placeholder) {
      if (n._placeholder.kind === "start") {
        n.arguments[n._placeholder.index] = bld.start(n._placeholder.name, c.currentFlx.currentOutput.signature);      
      }
      if (n._placeholder.kind === "post") {
        c.leaveScope();
        c.leaveFlx();

        return bld.post(n._placeholder.name, c.currentFlx.currentOutput.signature);
      }
    }
  }
}

_types.AssignmentExpression = {
  enter: function(n, c) {

    // TODO
    /*
      Here we need to get the first object of the MemberExpression as the modified object, and every first object in not computed MemberExpression as used object.
      For example :
        my_object.prop[my_index.my_prop] -> my_object is the modified object, my_index is an used object.
    */

    // red(n.left, {
    //   aggregate : function(prev, n) {
    //     if (n.type === "MemberExpression"){
    //       prev.push(n.object.name);

    //       if(n.computed) {
            
    //       }
    //     }
    //   },
    //   init : []
    // })






    // console.log(" ========================= ");
    // console.log(" ============ ", red(n.left, getId), " ============= ");

    // console.log("££ ", _c.id);

  },
  leave: function(n, c) {
    // console.log("leave =");
  }
}


//   identifier(name[, loc])
_types.Identifier = {
  enter: function(n, c) {

    // TODO bad design
    c.registerId(n);
  },
  leave: function(n, c) {
  }
}
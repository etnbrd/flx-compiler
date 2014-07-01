var recast = require("recast");
var fs = require("fs");

var cons = require("./constructors");

var errors = require("../lib/errors");
var h = require("../lib/helpers");
var map = require("../lib/traverse").map;
var red = require("../lib/traverse").reduce;


// var bld = require("./builders");

module.exports = start;

var _types = {};

function start(ast) {
  var context = new cons.Context(ast);
  context.enterFlx("Main", ast.program);
  map(ast.program, _iterator(context));
  context.leaveFlx();
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
    c.enterScope("Program"); // TODO change program for the name of the file, or another more specific name
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
            n._linkedFn = _n
            n._placeholder = {type: "Placeholder", name: name, kind: "start", index: i};
            n.arguments[i] = {type: "Placeholder", name: name, kind: "start", index: i};
          }
      })

    }
    
    // if (_c.id === "res.send") { // POSTERS
    //   var name = _c.id + "-" + h.salt();
    //   c.enterFlx(name, bld.postFlx(name, n), n.params "post");
    //   c.enterScope(name);
    //   n._placeholder = {type: "Placeholder", name: name, kind: "post"};
    // }

  },
  leave: function(n, c) {
    if (n._placeholder) {
      if (n._placeholder.kind === "start") {

        c.enterFlx(n._placeholder.name, n._linkedFn, "start");
        map(n._linkedFn, _iterator(c));
        c.leaveFlx();

        n.arguments[n._placeholder.index] = {type: "Identifier", kind: "start", name: "↠" + n._placeholder.name, signature: c.currentFlx.currentOutput.signature}; //bld.start(n._placeholder.name, c.currentFlx.currentOutput.signature);      
      }
      if (n._placeholder.kind === "post") {
        c.leaveScope();
        c.leaveFlx();

        return {type: "Identifier", kind: "post", name: "→" + n._placeholder.name, signature: c.currentFlx.currentOutput.signature}//bld.post(n._placeholder.name, c.currentFlx.currentOutput.signature);
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

    // c.currentFlx.outputs.forEach(function(output) {

    //   if ()

    // })

    if (!c.currentScope._var[n.name]) {
      var source = c.registerId(n);

      // If register said it's outside of scope, then replace futur occurence (in this fluxion) with msg._my_var_
      if (source) {
        if (!c.currentFlx.modifiers[n.name]) {
          c.currentFlx.modifiers[n.name] = {
            target : n.name
          }
        }
      }
    }






    // TODO Before modification, make sure, it's not in a MemberExpression
    // For exemple, if the variable send is in the signature, we don't want to modify rep.send into rep.msg.send

    if (c.currentFlx.modifiers[n.name]) {
      n.modifier = c.currentFlx.modifiers[n.name];
    }
  },
  leave: function(n, c) {
  }
}
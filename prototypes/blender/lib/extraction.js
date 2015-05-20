var recast = require("recast");
var b = require("recast").types.builders;

var h = require("./helpers");
var cons = require("./constructors");
var extract = require("./extract");
var bld = require("./builders");
var tpl = require("./templates");

module.exports = start;


function start(tree) {

  // Get the app.get nodes
  return tree.nodes.filter(h.customFinder({
    name: "app.get",
    kind: "CallExpression"
  })).reduce(function(contexts, appGetNode) {

    // Find app.get route
    var id = tree.deps.filter(h.customFinder({
      to: appGetNode.id,
      type: "Argument",
      index: 0
    }))[0].id;

    var routePath = tree.nodes.filter(h.customFinder({
      id: id
    }))[0].name;

    // Extract the chain from appGet
    var appGetChain = extract.down(tree, appGetNode.id);

    // Extract the chain from resSend in this specific appGet
    var resSendNode = appGetChain.nodes.filter(h.customFinder({
      name: "res.send",
      kind: "CallExpression"
    }))[0];

    var resSendArgDep = appGetChain.deps.filter(h.customFinder({
      to: resSendNode.id,
      type: "Argument"
    }))[0];

    var resSendArgNode = appGetChain.nodes.filter(h.idFinder(resSendArgDep.id))[0];
    var resSendChain = extract.up(tree, resSendArgNode.id);

    // Extract argChain Chain
    var argChain = extract.upOnly(tree, resSendArgNode.id);
    argChain.name = routePath;

    // TODO this doesn't belong here
    // Build object gathering all variables, and detect Global Variables.
    var vars = resSendChain.nodes.filter(function(node) {
      return node.kind === "VariableDeclarator";
    })

    var varDec = vars.reduce(function(varDec, _var) {
      varDec[_var.name] = varDec[_var.name] || [];
      if (_var.version) {
        varDec[_var.name][_var.version] = _var;
      } else {
        varDec[_var.name][0] = _var;
        varDec[_var.name].isGlobal = isGlobal(tree, _var, appGetNode);
      }
      return varDec;
    }, {});

    // Transform the graph so that global variable are computed from scope (not as a global).
    for (var __var in varDec) if (varDec[__var].isGlobal) { var _var = varDec[__var];
      // Extract initialisation of the global variable
      var varChain = extract.upOnly(argChain, _var[0].id);

      // break the VariableDeclarator dependency
      extract.breakFromId(argChain, _var[0].id);

      // Build the initial scope object
      var bottomNode = varChain.nodes.filter(function(node) {
        return varChain.deps.every(function(dep) {
          return dep.id !== node.id;
        })
      })

      // Transform every reference to that variable by the MemberExpression(this, var)
      argChain.nodes.forEach(function(node) {
        if (node.name === _var[0].name) {

          var vars = argChain.deps.filter(function(dep) {
            return dep.id === node.id || dep.to === node.id;
          })

          if (vars.length > 1) throw errors.multipleOccurences(vars);
          else vars = vars[0];

          // Replace each dependency pointing to that occurence (should be only one)
          var appendNode = appendThisMemberExpression(node);
          argChain.deps.forEach(function(dep) {
            if (node.id === dep.id) {
              dep.id = appendNode.id;
            }
            if (node.id === dep.to) {
              dep.to = appendNode.id;
            }
          })

          appendNode.deps.forEach(function(dep) {
            argChain.deps.push(dep);
          });

          appendNode.nodes.forEach(function(node) {
            argChain.nodes.push(node);
          });

          // TODO WTF ?!?
          // appendNode.deps.forEach(argChain.deps.push);
          // appendNode.nodes.forEach(argChain.nodes.push);
        }
      })

      console.log(argChain);


      var flxScp = bld(varChain).map(function(scp) {
        return b.property("init", scp.id, scp.init);
      })

      console.log(" --- ");

      var flxBody = bld(argChain);

      console.log(flxBody);

      // console.log(tpl.flxSimple(flxBody));

      // var flx = b.expressionStatement(
      //   b.callExpression(
      //     b.memberExpression(b.identifier("flx"), b.identifier("register"), false),
      //     [
      //       b.literal(routePath),
      //       bld(argChain),
      //       b.objectExpression(flxScp)
      //     ]
      //   )
      // )

      // console.log(flx);

      console.log(recast.prettyPrint(b.objectExpression(flxScp)).code);
      // console.log(recast.prettyPrint(bld(argChain)).code);

    }

    contexts.push(argChain);
    return contexts;
  }, new cons.MultiContext());
}

function isGlobal(tree, node, appGetNode) { // TODO this is bad design, why can't I detect from which appGet the node is from ?
  // Among the variables used in resSendChain, find the global ones


  console.log("isGlobal ? ", node.scope, tree.id);

  return !tree.path(node.id, appGetNode.id)
    .every(function(_path) {
      return _path.some(function(dep) {
        return !dep.type === "Before"
      })
    })
}

// TODO this belongs in a different step, like a transformation step.
function appendThisMemberExpression(node) {
  var meHash = h.hash(node.ref);
  var thisHash = h.hash(node.ref);

  // node.kind = "Identifier";

  return {
    id: meHash,
    nodes: [
      cons.Node(undefined, "this." + node.name, meHash, "MemberExpression"),
      cons.Node(undefined, "this", thisHash, "ThisExpression")
    ],
    deps: [
      cons.Dep(thisHash, meHash, "object"),
      cons.Dep(node.id, meHash, "property"),
    ]
  };
}
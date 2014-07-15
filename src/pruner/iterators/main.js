var iteratorFactory = require('../../lib/iterators'),
    estraverse = require('estraverse'),
    getIdIterator = require('./getid'),
    h = require('../../lib/helpers');

var _types = {};

_types.Program = {
    enter: function (c, n, p) {
        c.enterScope('Program'); // TODO change program for the name of the file, or another more specific name
    },
    leave: function (c, n, p) {
        c.leaveScope();
    }
};

//   functionDeclaration(name, args, body, isGenerator, isExpression[, loc])
//   functionExpression(name, args, body, isGenerator, isExpression[, loc])
_types.FunctionDeclaration = {
    enter: function (c, n, p) {
        c.enterScope(n.id.name);
        n.params.forEach(function (param) {
            c.registerVar(param);
        });
    },
    leave: function (c, n, p) {
        c.leaveScope();
    }
};

_types.FunctionExpression = _types.FunctionDeclaration;

//   variableDeclarator(patt, init[, loc])
_types.VariableDeclarator = {
    enter: function (c, n, p) {
        c.registerVar(n);
    },
    leave: function (c, n, p) {
    }
};

//   callExpression(callee, args[, loc])
_types.CallExpression = {
    enter: function (c, n, p) {
        // TODO this is bad design
        var _c = {id: ''};

        estraverse.traverse(n.callee, getIdIterator(_c));

        // TODO : no usecase
        // if (_c.id === 'require' && n.arguments.length > 0 && n.arguments[0].value[0] === '.') {
        //     var filename = n.arguments[0].value;

        //     if (filename.lastIndexOf('.js') !== filename.length - 3) {
        //         filename = filename + '.js';
        //     }

        //     var ast = recast.parse(fs.readFileSync(filename).toString());

        //     // TODO scope problem : a required file is not a new fluxion, only a new scope
        //     // OR fluxion Main is a special fluxion which is not a movable fluxion.
        //     c.enterScope(filename, true);
        //     map(ast.program, mainIterator(c));
        //     c.leaveScope();
        // }

        /*

            TODO need redesign
            we can't modify the ast, so we can't place our placeholders.
            We need to build another tree beside.

        */

        var salt = h.salt();

        if (_c.id === 'app.get') { // STARTERS
            n.arguments.forEach(function (_n, i) {
                if (_n.type === 'FunctionExpression' || _n.type === 'FunctionDeclaration') {
                    n.salt = salt;
                    var name = c.prepareFlx(salt, _n, 'start', i);
                    n.arguments[i] = {type: 'Identifier', kind: 'start', name: '↠' + name};
                }
            });

        }

        // if (_c.id === 'res.send') { // POSTERS
        //   var name = _c.id + '-' + h.salt();
        //   c.enterFlx(name, bld.postFlx(name, n), n.params 'post');
        //   c.enterScope(name);
        //   n._placeholder = {type: 'Placeholder', name: name, kind: 'post'};
        // }

    },
    leave: function (c, n, p) {
        if (n.salt) {
            c.getFutures(n.salt).forEach(function(flx) {
                if (flx.kind === 'start') {

                    c.enterFlx(flx.name, flx.fn, 'start');
                    estraverse.traverse(flx.fn, mainIterator(c));
                    c.leaveFlx();

                    // TODO this is bad design, we shouldn't modify the AST so much, remove signature, put it somwhere else
                    n.arguments[flx.index].signature = c.currentFlx.currentOutput.signature;
                }
                // TODO uncomment later, and replace n._placeholder with flx
                // if (n._placeholder.kind === 'post') {
                //     c.leaveScope();
                //     c.leaveFlx();

                //     return {type: 'Identifier', kind: 'post', name: '→' + n._placeholder.name, signature: c.currentFlx.currentOutput.signature};//bld.post(n._placeholder.name, c.currentFlx.currentOutput.signature);
                // }
            });
        }
    }
};

_types.AssignmentExpression = {
    enter: function (c, n, p) {

        // TODO
        /*
           Here we need to get the first object of the MemberExpression as the modified object, and every first object in not computed MemberExpression as used object.
           For example :
           my_object.prop[my_index.my_prop] -> my_object is the modified object, my_index is an used object.
           */


        // var res = red(n.left, {
        //     enter: function (n) {
        //         return n;
        //     },

        //     aggregate : function (prev, n) {
        //         if (n.type === 'MemberExpression') {
        //             // TODO
        //             // if(n.computed) {

        //             // }
        //         } else {
        //             prev.push(n);
        //         }

        //         return prev;
        //     },
        //     init : []
        //     });

        // TODO need redesign
        // We need map and reduce, design a module from estraverse

        var _context = [];

        var _iterator = {
                enter: function (n) {
                  if (n.type === 'MemberExpression') {
                      // TODO
                      // if(n.computed) {

                      // }
                  }
                  else
                      _context.push(n);
              }
          };

        estraverse.traverse(n.left, _iterator);

        function reserved(name) { // TODO find a better place for this function
            return !!(name === 'require' || name === 'exports' || name === 'module');
        }

        var res = _context; // TODO need redesign

        if (res.length > 0 && !reserved(res[0].name)) {
            c.registerMod(res[0]);
            c.currentFlx.registerModifier(res[0], 'scope'); // TODO might lead to conflict, as scope and fluxion scope aren't the same
        }


    },
    leave: function (c, n, p) {
    }
};


//   identifier(name[, loc])
_types.Identifier = {
    enter: function (c, n, p) {

        // console.log(n.name);

        function reserved(name) { // TODO find a better place for this function
            return !!(name === 'require' || name === 'exports' || name === 'module');
        }

        if (!reserved(n.name) && !c.currentScope._var[n.name]) {
            var source = c.registerId(n);
            // If register said it's outside of scope, then replace futur occurence (in this fluxion) with msg._my_var_
            if (source) {
                if (!c.currentFlx.modifiers[n.name]) {
                    c.currentFlx.registerModifier(n, 'signature');
                }
            }
        }

        // TODO Before modification, make sure, it's not in a MemberExpression
        // For exemple, if the variable send is in the signature, we don't want to modify rep.send into rep.msg.send

        if (c.currentFlx.modifiers[n.name]) {
            // TODO we shouldn't put modifier in the AST, instead this step beglongs to linker
            n.modifier = c.currentFlx.modifiers[n.name];
        }
    },
    leave: function (c, n, p) {
    }
};

var mainIterator = iteratorFactory(_types);
module.exports = mainIterator;

module.exports = iterator;

var estraverse = require("estraverse")
,   iterators = { // TODO this is ugly, we should make a factory to build the module based on the folder iterators of each compile step, and the iteratorFactory in lib/traverse
        main: require('./main'),
        getid: require('./getid')
    }
,   h = require("../../lib/helpers")
;    

function iterator(c) { // TODO refactor to extract this function from the defeinition of _types, and then dynamically generate iterator modules.
    function handlerFactory(type) {
        return function handler(n, p) {
            if (!n.type)
                throw errors.missingType(n);
            if (!!_types[n.type] && _types[n.type][type])
                return _types[n.type][type](n, p, c);
        };
    }

    return {
        enter: handlerFactory('enter'),
        leave: handlerFactory('leave')
    };
};

function reserved(name) { // TODO find a better place for this function
    return !!(name === 'require' || name === 'exports' || name === 'module' || name === 'console');
}

var _types = {};

_types.Program = {
    enter: function (n, p, c) {
        c.enterScope(n);
    },
    leave: function (n, p, c) {
        c.leaveScope(n);
    }
};

_types.FunctionDeclaration = _types.Program;
_types.FunctionExpression = _types.Program;

//   callExpression(callee, args[, loc])
_types.CallExpression = {
    enter: function (n, p, c) {
        // TODO this is bad design
        var _c = {id: ''};
        estraverse.traverse(n.callee, iterators.getid(_c));

        if (_c.id === 'app.get') { // STARTERS
            n.arguments.forEach(function (_n, i) {
                if (_n.type === 'FunctionExpression' || _n.type === 'FunctionDeclaration') {

                    var name = '↠' + _n.id.name; // TODO this should be an helper function to generate names

                    n.arguments[i] = {
                        type: 'Identifier',
                        name: name,
                        kind: 'start'
                    };

                    c.enterFlx(name, _n, 'start');
                    estraverse.traverse(_n, iterators.main(c));
                    c.leaveFlx();

                    // n.arguments[i].skip(); // TODO
                }
            });

        }
    },
    leave: function (n, p, c) {
    }
};

_types.AssignmentExpression = {
    enter: function (n, p, c) {

        var id = n.left.type === "MemberExpression" ? n.left.object : n.left;

        if (!reserved(id.name)) {
            c.registerModification(id);
        }
    },
    leave: function (n, p, c) {
    }
};

// _types.Program = {
//     enter: function (n, p, c) {

//         // TODO this doesn't belong here, it should be in the enterScope function
//         var _scp = c.scopes.scopes.filter(function(scope) {
//             return (scope.block === n)
//         })

//         c.enterScope('Program', _scp[0]); // TODO change program for the name of the file, or another more specific name
//     },
//     leave: function (n, p, c) {
//         c.leaveScope();
//     }
// };

// //   functionDeclaration(name, args, body, isGenerator, isExpression[, loc])
// //   functionExpression(name, args, body, isGenerator, isExpression[, loc])
// _types.FunctionDeclaration = {
//     enter: function (n, p, c) {


//         // TODO this doesn't belong here, it should be in the enterScope function
//         var _scp = c.scopes.scopes.filter(function(scope) {
//             return (scope.block === n)
//         })

//         // TODO for one function, there is two scope, one containing the function name (index 0), and one containing the body function (index 1), this need to be acknowledged.
//         c.enterScope(n.id.name, _scp[1]);
//         n.params.forEach(function (param) {
//             c.registerVar(param);
//         });
//     },
//     leave: function (n, p, c) {
//         c.leaveScope();
//     }
// };

// _types.FunctionExpression = _types.FunctionDeclaration;

// //   variableDeclarator(patt, init[, loc])
// _types.VariableDeclarator = {
//     enter: function (n, p, c) {
//         c.registerVar(n);
//     },
//     leave: function (n, p, c) {
//     }
// };

// //   callExpression(callee, args[, loc])
// _types.CallExpression = {
//     enter: function (n, p, c) {
//         // TODO this is bad design
//         var _c = {id: ''};

//         estraverse.traverse(n.callee, iterators.getid(_c));

//         // TODO : no usecase
//         // if (_c.id === 'require' && n.arguments.length > 0 && n.arguments[0].value[0] === '.') {
//         //     var filename = n.arguments[0].value;

//         //     if (filename.lastIndexOf('.js') !== filename.length - 3) {
//         //         filename = filename + '.js';
//         //     }

//         //     var ast = recast.parse(fs.readFileSync(filename).toString());

//         //     // TODO scope problem : a required file is not a new fluxion, only a new scope
//         //     // OR fluxion Main is a special fluxion which is not a movable fluxion.
//         //     c.enterScope(filename, true);
//         //     map(ast.program, iterators.main(c));
//         //     c.leaveScope();
//         // }

//         /*

//             TODO need redesign
//             we can't modify the ast, so we can't place our placeholders.
//             We need to build another tree beside.

//         */

//         var salt = h.salt();

//         if (_c.id === 'app.get') { // STARTERS
//             n.arguments.forEach(function (_n, i) {
//                 if (_n.type === 'FunctionExpression' || _n.type === 'FunctionDeclaration') {
//                     n.salt = salt;
//                     var name = c.prepareFlx(salt, _n, 'start', i);
//                     n.arguments[i] = {type: 'Identifier', kind: 'start', name: '↠' + name};
//                 }
//             });

//         }

//         // if (_c.id === 'res.send') { // POSTERS
//         //   var name = _c.id + '-' + h.salt();
//         //   c.enterFlx(name, bld.postFlx(name, n), n.params 'post');
//         //   c.enterScope(name);
//         //   n._placeholder = {type: 'Placeholder', name: name, kind: 'post'};
//         // }

//     },
//     leave: function (n, p, c) {
//         if (n.salt) {
//             c.getFutures(n.salt).forEach(function(flx) {
//                 if (flx.kind === 'start') {

//                     c.enterFlx(flx.name, flx.fn, 'start');
//                     estraverse.traverse(flx.fn, iterators.main(c));
//                     c.leaveFlx();

//                     // TODO this is bad design, we shouldn't modify the AST so much, remove signature, put it somwhere else
//                     n.arguments[flx.index].signature = c.currentFlx.currentOutput.signature;
//                 }
//                 // TODO uncomment later, and replace n._placeholder with flx
//                 // if (n._placeholder.kind === 'post') {
//                 //     c.leaveScope();
//                 //     c.leaveFlx();

//                 //     return {type: 'Identifier', kind: 'post', name: '→' + n._placeholder.name, signature: c.currentFlx.currentOutput.signature};//bld.post(n._placeholder.name, c.currentFlx.currentOutput.signature);
//                 // }
//             })
//         }
//     }
// };

// _types.AssignmentExpression = {
//     enter: function (n, p, c) {

//         // TODO
//         /*
//            Here we need to get the first object of the MemberExpression as the modified object, and every first object in not computed MemberExpression as used object.
//            For example :
//            my_object.prop[my_index.my_prop] -> my_object is the modified object, my_index is an used object.
//            */


//         // var res = red(n.left, {
//         //     enter: function (n) {
//         //         return n;
//         //     },

//         //     aggregate : function (prev, n) {
//         //         if (n.type === 'MemberExpression') {
//         //             // TODO
//         //             // if(n.computed) {

//         //             // }
//         //         } else {
//         //             prev.push(n);
//         //         }

//         //         return prev;
//         //     },
//         //     init : []
//         //     });

//         // TODO need redesign
//         // We need map and reduce, design a module from estraverse

//         var _context = [];

//         function _iterator(prev) {
//             return {
//                 enter: function (n) {
//                     if (n.type === 'MemberExpression') {
//                         // TODO
//                         // if(n.computed) {

//                         // }
//                     } else {
//                         _context.push(n);
//                     }



//                     // return prev;
//                 }
//             }
//         }

//         estraverse.traverse(n.left, _iterator([]))

//         function reserved(name) { // TODO find a better place for this function
//             return !!(name === 'require' || name === 'exports' || name === 'module' || name === 'console');
//         }

//         var res = _context; // TODO need redesign

//         if (res.length > 0 && !reserved(res[0].name)) {
//             c.registerMod(res[0]);
//             c.currentFlx.registerModifier(res[0], 'scope'); // TODO might lead to conflict, as scope and fluxion scope aren't the same
//         }

//         // console.log(' ============  ' + util.inspect(res) + '  ============= ');
//         // console.log(' ============ ', red(n.left, getId), ' ============= ');

//         // console.log('££ ', _c.id);

//     },
//     leave: function (n, p, c) {
//         // console.log('leave =');
//     }
// };


// //   identifier(name[, loc])
// _types.Identifier = {
//     enter: function (n, p, c) {

//         // console.log(n.name);

//         function reserved(name) { // TODO find a better place for this function
//             return !!(name === 'require' || name === 'exports' || name === 'module' || name === 'console');
//         }


//         function locateDeclaration(ref) {
//             var node, scope, i, v;

//             if (ref.resolved) {
//                 return ref.resolved.defs[ref.resolved.defs.length - 1].name;
//             }

//             scope = ref.from;
//             do {
//                 for (i = 0; i < scope.variables.length; ++i) {
//                     v = scope.variables[i];
//                     if (v.name === ref.identifier.name && v.defs.length) {
//                         return scope;
//                         // return v.defs[v.defs.length - 1].name;
//                     }
//                 }
//                 scope = scope.upper;
//             } while (scope);

//             return null;
//         }

//         if (!reserved(n.name) && !c.currentScope._var[n.name]) {

//             // console.log(c.currentScope.scope.variables);

//             // var _vars = c.currentScope.scope.variables.filter(function(_id) {
//             //     return _id.identifier === n;
//             // })

//             // console.log(_vars);


//             var source = c.registerId(n);

//             // if (source)
//             //     if (source === c.currentScope.scope) {
//             //         console.log("SAME SCOPE");
//             //     } else {
//             //         console.log("!!!!!! ", source, "\n ------------------------------ \n", c.currentScope.scope);
//             //     }

//             var ref = c.currentScope.scope.references.filter(function(ref) {
//                 return ref.identifier === n;  
//             });

//             if (ref.length > 0) {       
//                 if (ref.length > 1) {
//                     throw errors.multipleOccurences(ref);
//                 }

//                 var defScope = locateDeclaration(ref[0]);


//                 // defScope is the scope where the variable is declared, if this scope isn't within the scope of the current fluxion,
//                 // then replace futur occurence (in this fluxion) with msg._my_var_
//                 var scope = c.currentScope;

//                 while ( scope && scope.flx === c.currentFlx && scope !== defScope) {
//                     scope = scope.parent;
//                 }

//                 if (defScope !== scope) {
//                     if (!c.currentFlx.modifiers[n.name]) {
//                         c.currentFlx.registerModifier(n, 'signature');
//                     }
//                 }
//             }
//         }

//         // TODO Before modification, make sure, it's not in a MemberExpression
//         // For exemple, if the variable send is in the signature, we don't want to modify rep.send into rep.msg.send

//         if (c.currentFlx.modifiers[n.name]) {
//             // TODO we shouldn't put modifier in the AST, instead this step belongs to linker
//             n.modifier = c.currentFlx.modifiers[n.name];
//         }
//     },
//     leave: function (n, p, c) {
//     }
// };

// For requires, see the end of file.

var _types = {};

_types.Program = {
    enter: function (n, c) {
        c.enterScope('Program'); // TODO change program for the name of the file, or another more specific name
    },
    leave: function (n, c) {
        c.leaveScope();
    }
};

//   functionDeclaration(name, args, body, isGenerator, isExpression[, loc])
//   functionExpression(name, args, body, isGenerator, isExpression[, loc])
_types.FunctionDeclaration = {
    enter: function (n, c) {
        c.enterScope(n.id.name);
        n.params.forEach(function (param) {
            c.registerVar(param);
        });
    },
    leave: function (n, c) {
        c.leaveScope();
    }
};

_types.FunctionExpression = _types.FunctionDeclaration;

//   variableDeclarator(patt, init[, loc])
_types.VariableDeclarator = {
    enter: function (n, c) {
        c.registerVar(n);
    },
    leave: function (n, c) {
    }
};

//   callExpression(callee, args[, loc])
_types.CallExpression = {
    enter: function (n, c) {
        // TODO this is bad design
        var _c = {id: ''};

        map(n.callee, iterators.getid(_c));

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
        //     map(ast.program, iterators.main(c));
        //     c.leaveScope();
        // }

        if (_c.id === 'app.get') { // STARTERS
            n.arguments.forEach(function (_n, i) {
                if (_n.type === 'FunctionExpression' || _n.type === 'FunctionDeclaration') {
                    var placeholder = {type: 'Placeholder', name: _n.id.name, kind: 'start', index: i};
                    n._linkedFn = _n; // TODO can do better
                    n._placeholder = placeholder;
                    n.arguments[i] = placeholder;
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
    leave: function (n, c) {
        if (n._placeholder) {
            if (n._placeholder.kind === 'start') {

                c.enterFlx(n._placeholder.name, n._linkedFn, 'start');
                map(n._linkedFn, iterators.main(c));
                c.leaveFlx();

                n.arguments[n._placeholder.index] = {type: 'Identifier', kind: 'start', name: '↠' + n._placeholder.name, signature: c.currentFlx.currentOutput.signature}; //bld.start(n._placeholder.name, c.currentFlx.currentOutput.signature);      
            }
            if (n._placeholder.kind === 'post') {
                c.leaveScope();
                c.leaveFlx();

                return {type: 'Identifier', kind: 'post', name: '→' + n._placeholder.name, signature: c.currentFlx.currentOutput.signature};//bld.post(n._placeholder.name, c.currentFlx.currentOutput.signature);
            }
        }
    }
};

_types.AssignmentExpression = {
    enter: function (n, c) {

        // TODO
        /*
           Here we need to get the first object of the MemberExpression as the modified object, and every first object in not computed MemberExpression as used object.
           For example :
           my_object.prop[my_index.my_prop] -> my_object is the modified object, my_index is an used object.
           */


        var res = red(n.left, {
            enter: function (n) {
                return n;
            },

            aggregate : function (prev, n) {
                if (n.type === 'MemberExpression') {
                    // TODO
                    // if(n.computed) {

                    // }
                } else {
                    prev.push(n);
                }

                return prev;
            },
            init : []
            });

        function reserved(name) { // TODO find a better place for this function
            return !!(name === 'require' || name === 'exports' || name === 'module');
        }

        if (res.length > 0 && !reserved(res[0].name)) {
            c.registerMod(res[0]);
            c.currentFlx.registerModifier(res[0], 'scope'); // TODO might lead to conflict, as scope and fluxion scope aren't the same
        }

        // console.log(' ============  ' + util.inspect(res) + '  ============= ');
        // console.log(' ============ ', red(n.left, getId), ' ============= ');

        // console.log('££ ', _c.id);

    },
    leave: function (n, c) {
        // console.log('leave =');
    }
};


//   identifier(name[, loc])
_types.Identifier = {
    enter: function (n, c) {

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
            n.modifier = c.currentFlx.modifiers[n.name];
        }
    },
    leave: function (n, c) {
    }
};

// This file construction seems odd with the require and module.exports at bottom.
// But it is perfectly justified : as this file is required recursively, we need to export it before anything else.
// Thanks to hoisting, this work.
module.exports = _types;

var map = require('../../lib/traverse').map,
    red = require('../../lib/traverse').reduce,
    iterators = { // TODO this is ugly, we should make a factory to build the module based on the folder iterators of each compile step, and the iteratorFactory in lib/traverse
        main: require('../../lib/traverse').iterator(require('./main')),
        getid: require('../../lib/traverse').iterator(require('./getid'))
    };
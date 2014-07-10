var errors = require('../lib/errors');
var log = require('../lib/log');

// TODO merge Context and FlxScope prototypes, they share most of their properties and methods

// TODO there is two kind of scope here : function scope, and fluxion scope, we need to change the name of fluxion scope to something else.
// Like context, state, or persistence ...

////////////////////////////////////////////////////////////////////////////////
// FlxScope                                                                   //
////////////////////////////////////////////////////////////////////////////////

function FlxScope(name, ast) {
    this.name = name;
    this.ast = ast;
    this.input = [];
    this.outputs = [];
    this.modifiers = {};
    this.parents = [];
    this.scope = {};
}

FlxScope.prototype.current = function () {
    return this._stack[0];
};

FlxScope.prototype.enter = function () {
    log.enter('Enter flx ' + this.name);
    return this;
};

FlxScope.prototype.leave = function () {
    log.leave('Leave flx ' + this.name);
};

FlxScope.prototype.registerParent = function (parent, output) {
    this.parents.push({parent: parent, output: output});
};

FlxScope.prototype.registerOutput = function (output) {
    log.info(this.name + ' // ' + output.source.name +  ' -> ' + output.dest.name);
    this.outputs.push(output);
    this.currentOutput = output;
};

FlxScope.prototype.registerScope = function (id) {
    this.scope[id.name] = id;
};

FlxScope.prototype.registerModifier = function (id, type) { // TODO this should be directly triggered by registerId or registerMod

    // console.log('MODIFIER ', id.name || id, type, !!this.modifiers)

    if (!this.modifiers[id.name]) {
        this.modifiers[id.name] = { // TODO might lead to conflict, as scope and fluxion scope aren't the same
            target : type
        };
    } else if (type === 'scope') { // scope modifier is of higher priority
        this.registerScope(id); // TODO I am not sure if this is the right place for this line (but it seems to work :)
        this.modifiers[id.name].target = 'scope';
    }
};

////////////////////////////////////////////////////////////////////////////////
// FnScope                                                                    //
////////////////////////////////////////////////////////////////////////////////

function FnScope(name, parent, flx) {
    this._ids = {}; // TODO this needs refactoring, ids and var are the same.
    this._var = {};
    this.name = name;
    this.parent = parent;
    this.flx = flx;
}

FnScope.prototype.enter = function () {
    log.enter('Enter scope ' + this.name);
    return this;
};

FnScope.prototype.leave = function () {
    log.leave('Leave scope ' + this.name);
    var index,
        length = this._ids.length;

    for (index = 0; index < length; index += 1) {
        if (this._ids[index].used) {
            this.flx.registerScope(this._ids[index]);
        }
    }

    return this;
};

FnScope.prototype.registerId = function (id) {
    if (id.name) {
        var findVar;
        findVar = function (scope, name) {
            var index,
                _par,
                length = scope._var.length;

            for (index = 0; index < length; index += 1) {
                if (scope._var.length[index] === name) {
                    return scope.flx;
                }
            }

            if (scope.parent) {
                _par = findVar(scope.parent, name);
                if (_par) {
                    scope.parent.flx.currentOutput.registerSign(id);
                    return _par;
                }
            }

            return undefined;
        };

        if (!this._ids[id.name]) {
            this._ids[id.name] = id;
            log.use(log.bold(id.name) + log.grey(' // ' + this.name));
        } else {
            log.use(id.name + log.grey(' // ' + this.name));
            // throw errors.identifierConflict([id, this._ids[id.name]]);
        }

        return findVar(this, id.name);
    }
};

FnScope.prototype.registerMod = function (id) {

    if (id.name) {

        if (!this._ids[id.name]) {
            this.registerId(id);
        }

        if (this._var[id.name]) { // local modification, nothing to do
            log.mod(id.name + log.grey(' // ' + this.name));
        } else { // remote modification, need to do something
            this._ids[id.name].used = true;
            log.mod(log.bold(id.name) + log.grey(' // ' + this.name));
        }
    }
};

FnScope.prototype.registerVar = function (_var) {

    if (_var.id && _var.id.name) {
        _var = _var.id;
    }

    this._var[_var.name] = _var;
    log.vard(log.bold(_var.name) + log.grey(' // ' + this.name));
};

////////////////////////////////////////////////////////////////////////////////
// Output                                                                     //
////////////////////////////////////////////////////////////////////////////////

function Output(name, type, params, sourceFlx, destFlx) {
    function formatParam(param) {
        return {
            ast: param,
            name: param.name
        };
    }

    this.name = name;
    this.type = type;
    this.params = params.map(formatParam);
    this.source = sourceFlx;
    this.dest = destFlx;
    this.signature = {};
}

Output.prototype.registerSign = function (id) {
    log.sig(id.name + log.grey(' // ' + this.source.name + ' -> ' + this.dest.name));
    this.signature[id.name] = {
        name: id.name,
        id: id,
        source: this.source,
        dest: this.dest
    };
};

////////////////////////////////////////////////////////////////////////////////
// Context                                                                    //
////////////////////////////////////////////////////////////////////////////////

function Context(ast) {
    this._scopes = [];
    this._flx = {};
    this._stack = [];
    this._flxStack = [];
    this.currentScope = undefined;
    this.currentFlx = undefined;
    this.ast = ast;
    this.starts = [];
    this.name = ast.name;
    this.futurFlx = {};
}

// prepareFlx and getFutures need to be redesigned, it's just a quick fix.

Context.prototype.prepareFlx = function(node, fn, kind, index) {

    if (!this.futurFlx[node]) this.futurFlx[node] = [];

    var name = fn.id.name; // TODO make this more robust, with salt.

    this.futurFlx[node].push({
        name: name,
        fn: fn,
        kind: kind,
        index: index
    })

    return name;
}

Context.prototype.getFutures = function(node) {
    var futures = this.futurFlx[node];
    this.futurFlx[node] = undefined;
    return futures;
}

Context.prototype.enterFlx = function (name, ast, type) {

    // TODO Capitalize, I don't know where this modification is best placed, maybe in the main iterator
    // var name = name.charAt(0).toUpperCase() + name.slice(1);

    var _oldFlx = this.currentFlx,
        _newFlx = new FlxScope(name, ast),
        _out;

    this.currentFlx = _newFlx;
    this._flxStack.push(_newFlx);

    if (type) {
        _out = new Output(name, type, ast.params, _oldFlx, this.currentFlx);

        _newFlx.registerParent(_oldFlx, _out);
        _oldFlx.registerOutput(_out);
    } else {
        if (name !== 'Main') {
            console.log('entering a fluxion without an output');
        }
    }

    return this.currentFlx.enter(name);
};

Context.prototype.leaveFlx = function () {
    var flx = this._flxStack.pop();
    this.currentFlx = this._flxStack[this._flxStack.length - 1];
    if (!this._flx[flx.name]) {
        this._flx[flx.name] = flx;
        return flx.leave();
    }

    throw errors.flxConflict(this.currentFlx.name);
};

Context.prototype.enterScope = function (name, rootScope) {
    var scope = new FnScope(name, (rootScope ? undefined : this.currentScope), this.currentFlx);
    this._stack.push(scope);
    this.currentScope = scope;
    return scope.enter(name);
};

Context.prototype.leaveScope = function () {
    this.currentScope = this.currentScope.parent;
    var scope = this._stack.pop();
    this._scopes.push(scope);
    return scope.leave();
};

Context.prototype.registerId = function (id) {
    return this.currentScope.registerId(id);
};

Context.prototype.registerVar = function (_var) {
    return this.currentScope.registerVar(_var);
};

Context.prototype.registerOutput = function (output) {
    return this.currentFlx.registerOutput(output);
};

Context.prototype.registerMod = function (id) {
    return this.currentScope.registerMod(id);
};

module.exports = {
    Context: Context
};

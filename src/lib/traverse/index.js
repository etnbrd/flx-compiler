module.exports = {
  map: _maper(),
  reduce: _reducer(),
  iterator: iteratorFactory
}


function iteratorFactory(types) {  
  return function iterator(c) {
    function handlerFactory(type) {
      return function handler(n) {
        if (!n.type)
          throw errors.missingType(n);
        if (!!types[n.type] && types[n.type][type])
            return types[n.type][type](n, c);
      }
    }

    return {
      enter: handlerFactory('enter'),
      leave: handlerFactory('leave')
    }
  }
}

/******************************************************************************/
/* MAP                                                                        */
/******************************************************************************/

function _maper() {

  function map(n, it) {
    if (it.enter)
      var res = it.enter(n);
  
    if (res)
      return res

    types[n.type](n, it);

    if (it.leave)
      res = it.leave(n);

    return res || n;
  }

  var mapers = {};
  mapers.array = function(name) {
    return function(n, it) {
      n[name] = n[name].map(function(n) {
        return map(n, it) || n;
      });
    }
  }

  mapers.nullable = function(names) {
    return function(n, it) {
      for(var maper in names) {
        if (n[names[maper]])
            mapers[maper](names[maper])(n, it);
      }
    }
  }

  mapers.single = function(name) {
    return function(n, it) {
      n[name] = map(n[name], it) || n[name];
    }
  }

  mapers.binary = function(left, right) {
    return function(n, it) {
      [left, right].forEach(function(op) {
        n[op] = map(n[op], it) || n[op];
      })
    }
  }

  mapers.end = function(n, it) {
    return false;
  }

  mapers.composite = function(childs) {
    return function(n, it) {
      for(var name in childs) {
        mapers[name](childs[name])(n, it);
      }
    }
  }

  mapers.todo = function(n, it) {
    console.log("// TODO ", n);
  }

  var types = _types(mapers);

  return map;
}


/******************************************************************************/
/* REDUCE                                                                     */
/******************************************************************************/

function _reducer() {

  function reduce(n, it) {

    function _agg(n) {
      if (n)
        return it.aggregate(it.init, n);
      else
        return it.init;
    }

    if (it.enter) {
      it.init = _agg(it.enter(n));
    }

    var res = types[n.type](n, it);

    if (it.leave) {
      it.init = _agg(it.leave(n, it.init));
    }

    return it.init;
  }

  var reducers = {};
  reducers.array = function(name) {
    return function(n, it) {
      return n[name].reduce(function(prev, n) {
        return reduce(n, it);
      }, it.init);
    }
  }

  reducers.nullable = function(name) {
    return function(n, it) {
        console.log('// TODO : never reached ', n);
    }
  }

  reducers.single = function(name) {
    return function(n, it) {
      return reduce(n[name], it);
    }
  }

  reducers.binary = function(left, right) {
    return function(n, it) {
      return [left, right].reduce(function(prev, op) {
        return reduce(n[op], it);
      }, it.init)
    }
  }

  reducers.end = function(n, it) {
    return false;
  }

  reducers.composite = function(childs) {
    return function(n, it) {
      for(var name in childs) {
        it.init = reducers[name](childs[name])(n, it);
      }

      return it.init;
    }
  }

  reducers.todo = function(n, it) {
    console.log("// TODO ", n);
  }

  var types = _types(reducers);

  return reduce;
}





/******************************************************************************/
/* WALKERS                                                                    */
/******************************************************************************/

function _types(_walkers) {

  return {
////////////////////////////////////////////////////////////////////////////////
// Programs                                                                   //
////////////////////////////////////////////////////////////////////////////////
    Program: _walkers.array("body"),

////////////////////////////////////////////////////////////////////////////////
// Statements                                                                 //
////////////////////////////////////////////////////////////////////////////////
    EmptyStatement: _walkers.end,
    BlockStatement: _walkers.array("body"),
    ExpressionStatement: _walkers.single("expression"),
    LabeledStatement: _walkers.binary("label", "body"),
    IfStatement: _walkers.composite({
      single: "test",
      single: "consequent",
      nullable: { single: "alternate" }
    }),
    SwitchStatement: _walkers.composite({
      single: "discriminent",
      array: "cases"
    }),
    WhileStatement: _walkers.binary("test", "body"),
    DoWhileStatement: _walkers.binary("test", "body"),
    ForStatement: _walkers.composite({
      nullable: { single: "init"},
      nullable: { single: "test"},
      nullable: { single: "update"},
      single: "body"
    }),
    ForInStatement: _walkers.composite({
      single: "left",
      single: "right",
      single: "body"
    }),
    BreakStatement: _walkers.nullable({ single: "label" }),
    ContinueStatement: _walkers.nullable({ single: "label" }),
    WithStatement: _walkers.binary("object", "body"),
    ReturnStatement: _walkers.single("argument"),
    TryStatement: _walkers.composite({
      single: "body",
      array: "handlers",
      nullable: { array: "guardedHandlers" },
      nullable: { single: "finalizer" }
    }),
    ThrowStatement: _walkers.single("argument"),
    DebuggerStatement: _walkers.end,
    LetStatement: _walkers.composite({
      array: "head",
      single: "body"
    }),


////////////////////////////////////////////////////////////////////////////////
// Declarations                                                               //
////////////////////////////////////////////////////////////////////////////////
    FunctionDeclaration: _walkers.composite({
      single: "id",
      array: "params",
      single: "body"
    }),
    VariableDeclaration: _walkers.array("declarations"),
    VariableDeclarator: _walkers.binary("id", "init"),

////////////////////////////////////////////////////////////////////////////////
// Expressions                                                                //
////////////////////////////////////////////////////////////////////////////////
    SequenceExpression: _walkers.array("expressions"),
    ConditionalExpression: _walkers.composite({
      single: "test",
      single: "consequent",
      single: "alternate"
    }),
    UnaryExpression: _walkers.binary("op", "arg"),
    BinaryExpression: _walkers.binary("left", "right"),
    AssignmentExpression: _walkers.binary("left", "right"),
    LogicalExpression: _walkers.binary("left", "right"),
    UpdateExpression: _walkers.binary("op", "arg"),
    NewExpression: _walkers.composite({
      single: "callee",
      array: "args"
    }),
    CallExpression: _walkers.composite({
      single: "callee",
      array: "arguments"
    }),
    MemberExpression: _walkers.binary("object", "property"),
    FunctionExpression: _walkers.composite({
      single: "id",
      array: "params",
      single: "body"
    }),
    ArrayExpression: _walkers.nullable({ array: "elements" }),
    ObjectExpression: _walkers.todo, // TODO an objectExpression in an array of custom object without type, so we can't simply use array. we need a better composition : array can take a string, or a composite element
    ThisExpression: _walkers.end,
    GraphExpression: _walkers.single("expression"),
    GraphIndexExpression: _walkers.end,
    ComprehensionExpression: _walkers.todo,
    GeneratorExpression: _walkers.todo,
    YieldExpression: _walkers.todo,
    LetExpression: _walkers.todo,


////////////////////////////////////////////////////////////////////////////////
// Patterns                                                                   //
////////////////////////////////////////////////////////////////////////////////
    ArrayPattern: _walkers.todo, // TODO an ArrayPattern is an array of nullable pattern
    ObjectPattern: _walkers.todo, // TODO same as ObjectExpression
    PropertyPattern: _walkers.todo,


////////////////////////////////////////////////////////////////////////////////
// Clauses                                                                    //
////////////////////////////////////////////////////////////////////////////////
    SwitchCase: _walkers.composite({
      nullable: { single: "test" },
      array: "consequent"
    }),
    CatchClause: _walkers.composite({
      single: "param",
      nullable: { single: "guard"},
      single: "body"
    }),
    ComprehensionBlock: _walkers.binary("left", "right"),


////////////////////////////////////////////////////////////////////////////////
// Miscellaneous                                                              //
////////////////////////////////////////////////////////////////////////////////
    Identifier: _walkers.end,
    Literal: _walkers.end,
    Property: _walkers.todo,

    Placeholder: _walkers.end // TODO this should be removable
  }
}

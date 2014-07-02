module.exports = {
  map: _maper(),
  reduce: _reducer()
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
    EmptyStatement: _walkers.todo,
    BlockStatement: _walkers.array("body"),
    ExpressionStatement: _walkers.single("expression"),
    LabeledStatement: _walkers.todo,
    IfStatement: _walkers.composite({
      single: "test",
      single: "consequent",
      nullable: { single: "alternate" }
    }),
    SwitchStatement: _walkers.todo,
    WhileStatement: _walkers.todo,
    DoWhileStatement: _walkers.todo,
    ForStatement: _walkers.todo,
    ForInStatement: _walkers.todo,
    BreakStatement: _walkers.todo,
    ContinueStatement: _walkers.todo,
    WithStatement: _walkers.todo,
    ReturnStatement: _walkers.single("argument"),
    TryStatement: _walkers.todo,
    ThrowStatement: _walkers.todo,
    DebuggerStatement: _walkers.todo,
    LetStatement: _walkers.todo,


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
    SequenceExpression: _walkers.todo,
    ConditionalExpression: _walkers.todo,
    UnaryExpression: _walkers.todo,
    BinaryExpression: _walkers.binary("left", "right"),
    AssignmentExpression: _walkers.binary("left", "right"),
    LogicalExpression: _walkers.binary("left", "right"),
    UpdateExpression: _walkers.todo,
    NewExpression: _walkers.todo,
    Argument: _walkers.todo,
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
    ArrayExpression: _walkers.todo,
    ObjectExpression: _walkers.array("properties"),
    ThisExpression: _walkers.todo,
    GraphExpression: _walkers.todo,
    GraphIndexExpression: _walkers.todo,
    ComprehensionExpression: _walkers.todo,
    GeneratorExpression: _walkers.todo,
    YieldExpression: _walkers.todo,
    LetExpression: _walkers.todo,


////////////////////////////////////////////////////////////////////////////////
// Patterns                                                                   //
////////////////////////////////////////////////////////////////////////////////
    ArrayPattern: _walkers.todo,
    ObjectPattern: _walkers.todo,
    PropertyPattern: _walkers.todo,


////////////////////////////////////////////////////////////////////////////////
// Clauses                                                                    //
////////////////////////////////////////////////////////////////////////////////
    SwitchCase: _walkers.todo,
    CatchClause: _walkers.todo,
    ComprehensionBlock: _walkers.todo,


////////////////////////////////////////////////////////////////////////////////
// Miscellaneous                                                              //
////////////////////////////////////////////////////////////////////////////////
    Identifier: _walkers.end,
    Literal: _walkers.end,
    Property: _walkers.todo,

    Placeholder: _walkers.end
  }
}

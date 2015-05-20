var b = require('recast').types.builders

module.exports = {
  program: program,
  requires: requires,
  register: register,
  registerScp: registerScp,
  route: route,
  flxSimple: flxSimple,
  HelloWorld: HelloWorld,
  placeholder: placeholder
}


function program(n) {
  return b.program(n);
}

function requires(path) {
  return b.variableDeclaration("var", [
    b.variableDeclarator(b.identifier("flx"), b.callExpression(
      b.identifier("require"), // Anonymize the function expression.
      [b.literal("./lib/flx")]
    )),
    b.variableDeclarator(b.identifier("web"), b.callExpression(
      b.identifier("require"), // Anonymize the function expression.
      [b.literal("./lib/web")]
    ))
  ]);
}

function register(name, fn) {
  return b.expressionStatement(
    b.callExpression(
      b.memberExpression(b.identifier("flx"), b.identifier("register"), false),
      [
        b.literal(name),
        fn
      ]
    )
  )
}

function registerScp(name, fn, scp) {
  return b.expressionStatement(
    b.callExpression(
      b.memberExpression(b.identifier("flx"), b.identifier("register"), false),
      [
        b.literal(name),
        fn,
        b.objectPattern(scp)
      ]
    )
  )
}

function route(path, next, name) {
  return b.expressionStatement(
    b.callExpression(
      b.memberExpression(b.identifier("web"), b.identifier("route"), false),
      [
        b.literal(path),
        b.literal(next),
        b.literal(name)
      ]
    )
  )
}

function placeholder(name, next) {
  return b.functionExpression(b.identifier(name), [
      b.identifier("req"),
      b.identifier("res")
    ],
    b.blockStatement([
      b.returnStatement(
        b.callExpression(
          b.memberExpression(
            b.identifier("flx"),
            b.identifier("start"),
            false
          ),
          [
            b.callExpression(
              b.memberExpression(
                b.identifier("flx"),
                b.identifier("m"),
                false
              ),
              [
                b.literal(next),
                b.identifier("res")
              ]
            )
          ]
        )
      )
    ])
  )
}

function flxSimple(msg) {
  return b.functionExpression(b.identifier("fn"), [
      b.identifier("msg")
    ],
    b.blockStatement([
      b.returnStatement(
        b.callExpression(
          b.memberExpression(
            b.identifier("flx"),
            b.identifier("m"),
            false
          ),
          [
            b.literal("output"),
            msg
          ]
        )
      )
    ])
  )
}

function HelloWorld(msg) {
  return b.functionExpression(b.identifier("HelloWorld"), [
      b.identifier("msg")
    ],
    b.blockStatement([
      b.returnStatement(
        b.callExpression(
          b.memberExpression(
            b.identifier("flx"),
            b.identifier("m"),
            false
          ),
          [
            b.literal("output"),
            msg
          ]
        )
      )
    ])
  )
}
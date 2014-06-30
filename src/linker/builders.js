var b = require('recast').types.builders

module.exports = {
  // program: program,
  // requires: requires,
  // registerScp: registerScp,
  // route: route,
  // flxSimple: flxSimple,
  // HelloWorld: HelloWorld,
  // postFlx : postFlx

  
  requireflx: requireflx,
  placeholder: placeholder,
  register: register,
  start: startPlaceholder,
  post: postPlaceholder,

  signatureModifier: signatureModifier,
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

function requireflx() {
  return b.variableDeclaration("var", [
    b.variableDeclarator(b.identifier("flx"), b.callExpression(
      b.identifier("require"), // Anonymize the function expression.
      [b.literal("flx")]
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

// function placeholder(next) {
//   return b.functionExpression(b.identifier("placeholder"), [
//     ],
//     b.blockStatement([
//       b.returnStatement(
//         b.callExpression(
//           b.memberExpression(
//             b.identifier("flx"),
//             b.identifier("start"),
//             false
//           ),
//           [
//             b.callExpression(
//               b.memberExpression(
//                 b.identifier("flx"),
//                 b.identifier("m"),
//                 false
//               ),
//               [
//                 b.literal(next),
//                 b.identifier("arguments")
//               ]
//             )
//           ]
//         )
//       )
//     ])
//   )
// }

function placeholder(next) {
  return b.callExpression(
          b.memberExpression(
            b.identifier("flx"),
            b.identifier("post"),
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
                b.identifier("arguments")
              ]
            )
          ]
        )
}


function startPlaceholder(next, signature) {
  return b.functionExpression(b.identifier("placeholder"), [
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
                b.objectExpression([
                  b.property("init", b.identifier("_args"), b.identifier("arguments")),
                  b.property("init", b.identifier("_sign"), b.objectExpression(
                    Object.keys(signature).map(function(need) {
                      return b.property("init", b.identifier(need), b.identifier(need));
                    })
                  ))
                ])
              ]
            )
          ]
        )
      )
    ])
  )
}


function postPlaceholder(next, signature) {

  return b.callExpression(
          b.memberExpression(
            b.identifier("flx"),
            b.identifier("post"),
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
                b.objectExpression([
                  b.property("init", b.identifier("_args"), b.identifier("arguments")),
                  b.property("init", b.identifier("_sign"), b.objectExpression(
                    Object.keys(signature).map(function(need) {
                      return b.property("init", b.identifier(need), b.identifier(need));
                    })
                  ))
                ])
              ]
            )
          ]
        )
}

function postFlx(name, body) {

  if (body.type !== "BlockStatement") {
    body = b.blockStatement([
      b.expressionStatement(
        body
      )
    ])
  }

  return b.functionExpression(b.identifier(name), [
      b.identifier("msg")
    ],
    body
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

function register(name, fn) {

  // flx.register(name, function capsule(msg) {
  //   // merge scope (this) and signature (msg._sign)
  //   (function reply(req, res) {
  //     res.send(\42\);
  //   })(msg._args);
  // })

  function _register(name, fn) { // TODO duplicate with register
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

  function _capsule(fn) {
    return b.functionExpression(b.identifier("capsule"), //name, args, body, isGenerator, isExpression
      [b.identifier("msg")],
      b.blockStatement([
        b.expressionStatement(
          b.callExpression(
            b.memberExpression(fn,
            b.identifier("apply"), false),
            [
              b.thisExpression(),
              b.memberExpression(b.identifier("msg"), b.identifier("_args"), false)
            ]
          )
        )
      ]),
      false, // isGenerator
      false  // isExpression
    )
  }

  return _register(name, _capsule(fn))
}

function signatureModifier(name) {
  return b.memberExpression(
    b.identifier("msg"),
    b.memberExpression(
      b.identifier("_sign"),
      b.identifier(name),
      false
    ),
    false
  )
}
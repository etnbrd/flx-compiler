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
  scopeModifier: scopeModifier
};

var b = require('ast-types').builders;

function requireflx() {
  return b.variableDeclaration('var', [
      b.variableDeclarator(b.identifier('flx'), b.callExpression(
          b.identifier('require'), // Anonymize the function expression.
          [b.literal('flx')]
          ))
      ]);
}

// function register(name, fn, scope) {

//   return b.expressionStatement(
//     b.callExpression(
//       b.memberExpression(b.identifier('flx'), b.identifier('register'), false),
//       [
//         b.literal(name),
//         fn,
//         _scope
//       ]
//     )
//   )
// }

// function registerScp(name, fn, scp) {
//     return b.expressionStatement(
//             b.callExpression(
//                 b.memberExpression(b.identifier('flx'), b.identifier('register'), false),
//                 [
//                 b.literal(name),
//                 fn,
//                 b.objectPattern(scp)
//                 ]
//                 )
//             )
// }

// function route(path, next, name) {
//     return b.expressionStatement(
//             b.callExpression(
//                 b.memberExpression(b.identifier('web'), b.identifier('route'), false),
//                 [
//                 b.literal(path),
//                 b.literal(next),
//                 b.literal(name)
//                 ]
//                 )
//             )
// }

// function placeholder(next) {
//   return b.functionExpression(b.identifier('placeholder'), [
//     ],
//     b.blockStatement([
//       b.returnStatement(
//         b.callExpression(
//           b.memberExpression(
//             b.identifier('flx'),
//             b.identifier('start'),
//             false
//           ),
//           [
//             b.callExpression(
//               b.memberExpression(
//                 b.identifier('flx'),
//                 b.identifier('m'),
//                 false
//               ),
//               [
//                 b.literal(next),
//                 b.identifier('arguments')
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
        b.identifier('flx'),
        b.identifier('post'),
        false
        ),
      [
      b.callExpression(
        b.memberExpression(
          b.identifier('flx'),
          b.identifier('m'),
          false
          ),
        [
        b.literal(next),
        b.identifier('arguments')
        ]
        )
      ]
      );
}


function startPlaceholder(next, signature) {

  var _signature = [];
  if (signature) {
    _signature = Object.keys(signature).map(function(need) {
      return b.property('init', b.identifier(need), b.identifier(need));
    })
  }

  return b.functionExpression(b.identifier('placeholder'), [
      ],
      b.blockStatement([
        b.returnStatement(
          b.callExpression(
            b.memberExpression(
              b.identifier('flx'),
              b.identifier('start'),
              false
              ),
            [
            b.callExpression(
              b.memberExpression(
                b.identifier('flx'),
                b.identifier('m'),
                false
                ),
              [
              b.literal(next),
              b.objectExpression([
                b.property('init', b.identifier('_args'), b.identifier('arguments')),
                b.property('init', b.identifier('_sign'), b.objectExpression(
                    _signature
                    ))
                ])
              ]
              )
            ]
            )
            )
            ])
            );
}


function postPlaceholder(next, signature) {

  return b.callExpression(
      b.memberExpression(
        b.identifier('flx'),
        b.identifier('post'),
        false
        ),
      [
      b.callExpression(
        b.memberExpression(
          b.identifier('flx'),
          b.identifier('m'),
          false
          ),
        [
        b.literal(next),
        b.objectExpression([
          b.property('init', b.identifier('_args'), b.identifier('arguments')),
          b.property('init', b.identifier('_sign'), b.objectExpression(
              Object.keys(signature).map(function(need) {
                return b.property('init', b.identifier(need), b.identifier(need));
              })
              ))
          ])
        ]
        )
      ]
      );
}

// function postFlx(name, body) {

//     if (body.type !== 'BlockStatement') {
//         body = b.blockStatement([
//                 b.expressionStatement(
//                     body
//                     )
//                 ])
//     }

//     return b.functionExpression(b.identifier(name), [
//             b.identifier('msg')
//             ],
//             body
//             )

// }


// function flxSimple(msg) {
//     return b.functionExpression(b.identifier('fn'), [
//             b.identifier('msg')
//             ],
//             b.blockStatement([
//                 b.returnStatement(
//                     b.callExpression(
//                         b.memberExpression(
//                             b.identifier('flx'),
//                             b.identifier('m'),
//                             false
//                             ),
//                         [
//                         b.literal('output'),
//                         msg
//                         ]
//                         )
//                     )
//                 ])
//             )
// }

// function HelloWorld(msg) {
//     return b.functionExpression(b.identifier('HelloWorld'), [
//             b.identifier('msg')
//             ],
//             b.blockStatement([
//                 b.returnStatement(
//                     b.callExpression(
//                         b.memberExpression(
//                             b.identifier('flx'),
//                             b.identifier('m'),
//                             false
//                             ),
//                         [
//                         b.literal('output'),
//                         msg
//                         ]
//                         )
//                     )
//                 ])
//             )
// }

function register(name, fn, scope) {

  // flx.register(name, function capsule(msg) {
  //   // merge scope (this) and signature (msg._sign)
  //   (function reply(req, res) {
  //     res.send(\42\);
  //   })(msg._args);
  // })

  function _register(name, fn, scope) { // TODO duplicate with register
    var _scope = b.objectExpression([]);
    if (scope) {
      _scope = b.objectExpression(
            Object.keys(scope).map(function(id) {
              return b.property('init', b.identifier(id), b.identifier(id));
            })
          );
    }

    return b.expressionStatement(
        b.callExpression(
          b.memberExpression(b.identifier('flx'), b.identifier('register'), false),
          [
            b.literal(name),
            fn,
            _scope
          ])
        );
  }

  function _capsule(fn) {
    return b.functionExpression(b.identifier('capsule'), //name, args, body, isGenerator, isExpression
        [b.identifier('msg')],
        b.blockStatement([
          b.expressionStatement(
            b.callExpression(
              b.memberExpression(fn,
                b.identifier('apply'), false),
              [
              b.thisExpression(),
              b.memberExpression(b.identifier('msg'), b.identifier('_args'), false)
              ]
              )
            )
          ]),
        false, // isGenerator
        false  // isExpression
        );
  }

  return _register(name, _capsule(fn), scope);
}

function signatureModifier(name) {
  return b.memberExpression(
    b.memberExpression(
      b.identifier('msg'),
      b.identifier('_sign'),
      false
    ),
    b.identifier(name),
    false
   );
}

function scopeModifier(name) {
  return b.memberExpression (
    b.identifier('this'),
    b.identifier(name),
    false
  );
}
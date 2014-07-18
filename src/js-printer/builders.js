var b = require('ast-types').builders;

function requireflx() {
  return b.variableDeclaration('var', [
      b.variableDeclarator(b.identifier('flx'), b.callExpression(
          b.identifier('require'), // Anonymize the function expression.
          [b.literal('flx')]
          ))
      ]);
}

function starter(next) {
  return b.callExpression(
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
          b.objectExpression([])
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
            ])
          ]
        )
      )
    ])
  );
}

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
    b.thisExpression(),
    b.identifier(name),
    false
  );
}

function syncModifier(name) {
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

function syncBuilder(sync) {


  console.log(sync);

  // TODO publish the variables in sync to their root.
  // TODO the root need to be able to receive messages.

  return b.expressionStatement(
    b.identifier("// TODO here we need to publish synced variable : " + Object.keys(sync).join(', '))
  ); 

}

function fn(body) {
  return b.functionExpression(b.identifier("root"), [], b.blockStatement(body));
}

module.exports = {
  requireflx: requireflx,
  starter: starter,

  register: register,
  start: startPlaceholder,

  signatureModifier: signatureModifier,
  scopeModifier: scopeModifier,
  syncModifier: syncModifier,

  syncBuilder: syncBuilder,

  fnCapsule: fn
};

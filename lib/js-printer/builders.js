'use strict';


var b = require('ast-types').builders,
    esprima = require('esprima');

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
      return need + ': ' + need + ',\n'; 

      // b.property('init', b.identifier(need), b.identifier(need));
    });
  }

  _signature = _signature.join('\n');

  var code = [
    'function placeholder() {',
    '  return flx.start(flx.m(\'' + next + '\', {',
    '    _args: arguments,',
    '    _sign: {' + _signature + '}',
    '  }));',
    '}'
  ].join('\n');

  var ast = esprima.parse(code);

  // TODO WAT ?
  ast.body[0].type = 'FunctionExpression';

  return ast.body[0];

  // return b.functionExpression(b.identifier('placeholder'), [
  //   ],
  //   b.blockStatement([
  //     b.returnStatement(
  //       b.callExpression(
  //         b.memberExpression(
  //           b.identifier('flx'),
  //           b.identifier('start'),
  //           false
  //           ),
  //         [
  //         b.callExpression(
  //           b.memberExpression(
  //             b.identifier('flx'),
  //             b.identifier('m'),
  //             false
  //             ),
  //           [
  //           b.literal(next),
  //           b.objectExpression([
  //             b.property('init', b.identifier('_args'), b.identifier('arguments')),
  //             b.property('init', b.identifier('_sign'), b.objectExpression(
  //                 _signature
  //                 ))
  //             ])
  //           ])
  //         ]
  //       )
  //     )
  //   ])
  // );
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


    // TODO this is way nicer than complex ast building, stop using b.
    // TODO precompile every snippet to reduce compilation time.
    var code = [
      'if (msg._update) {',
      '  for (var i in msg._update) {',
      '    this[i] = msg._update[i]',
      '  }',
      '} else {',
      '  PLACEHOLDER;',
      '}'
    ].join('\n');

    var ast = esprima.parse(code).body[0];


    ast.alternate.body = [
      b.expressionStatement(
        b.callExpression(
          b.memberExpression(
            fn,
            b.identifier('apply'),
            false
          ),
          [
            b.thisExpression(),
            b.memberExpression(b.identifier('msg'), b.identifier('_args'), false)
          ]
        )
      )
    ];

    return b.functionExpression(b.identifier('capsule'), //name, args, body, isGenerator, isExpression
        [b.identifier('msg')],
        b.blockStatement([
            ast
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
  return scopeModifier(name);
}

function syncBuilder(sync, flx) {

  // TODO this is a quick fix.
  // we need to make sure we don't send a variable to a fluxion that don't need it.

  // TODO remove the second argument, and retrieve the current flx by other means.

  // TODO there is still some bugs with Problem#5 : the value of _rep sent to the client is delayed by one request.
  var i,
      upstreams = {};


  for (i in sync) { var dep = sync[i];
    upstreams = dep.variable.references.reduce(function(upstreams, ref) {
      if (ref.from.flx.name !== flx.name && !ref.from.flx.root) {
        upstreams[ref.from.flx.name] = ref.from.flx;
      }
      return upstreams;
    }, upstreams);
  }

  var deps = Object.keys(sync).reduce(function(deps, sync) {
    return deps += sync + ': this.' + sync;
  }, '');

  var code = [
    'flx.start(flx.m(\'' + Object.keys(upstreams).join('\', \'') + '\', {_update: {' + deps + '}}))'
  ].join('\n');

  return esprima.parse(code);

}

function fn(body) {
  return b.functionExpression(b.identifier('root'), [], b.blockStatement(body));
}

function postPlaceholder(next, signature) {

  var _signature = [];
  if (signature) {
    _signature = Object.keys(signature).map(function(need) {
      return need + ': ' + need + ',\n'; 

      // b.property('init', b.identifier(need), b.identifier(need));
    });
  }

  _signature = _signature.join('\n');

  var code = [
    'function placeholder() {',
    '  return flx.post(flx.m(\'' + next + '\', {',
    '    _args: arguments,',
    '    _sign: {' + _signature + '}',
    '  }));',
    '}'
  ].join('\n');

  var ast = esprima.parse(code);

  // TODO WAT ?
  ast.body[0].type = 'FunctionExpression';

  return ast.body[0];
}

module.exports = {
  requireflx: requireflx,
  starter: starter,

  register: register,
  start: startPlaceholder,
  post: postPlaceholder,

  signatureModifier: signatureModifier,
  scopeModifier: scopeModifier,
  syncModifier: syncModifier,

  syncBuilder: syncBuilder,

  fnCapsule: fn
};

var b = require('recast').types.builders;


function requireflx() {
    return b.variableDeclaration('var', [
            b.variableDeclarator(b.identifier('flx'), b.callExpression(
                    b.identifier('require'), // Anonymize the function expression.
                    [b.literal('flx')]
                    ))
            ]);
}

function startPlaceholder(next, signature) {
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
                                        Object.keys(signature).map(function(need) {
                                            return b.property('init', b.identifier(need), b.identifier(need));
                                        })
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

function register(name, fn, scope) {

    function _register(name, fn, scope) { // TODO duplicate with register
        var _scope;
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
                    ]
                    )
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

module.exports = {
    requireflx: requireflx,
    register: register,
    start: startPlaceholder
};

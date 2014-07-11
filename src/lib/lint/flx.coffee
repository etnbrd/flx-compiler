fs = require 'fs'
esprima = require 'esprima'
escope = require 'escope'

get_flxs = (code, f) ->
    ast = esprima.parse(code, { loc: true, range: true })
    scopes = escope.analyze(ast).scopes
    scopes[0].block.body
        .filter (n) -> n.expression && n.expression.type == 'CallExpression'
        .map (n) -> n.expression
        .filter (n) -> n.callee.object.name == 'flx' && n.callee.property.name == 'register'
        .map (n) -> n.arguments
        .map (n) -> n.filter (m) -> m.type == 'FunctionExpression'
        .map (n) -> n[0]
        .map (n) -> n.range
        .map (p) -> scopes.filter (s) -> s.block.range == p
        .map (n) -> n.map (m) -> m.childScopes[0]
        .map (n) -> n.map (m) -> m.childScopes[0]
        .map (n) ->
            m = n[1]
            {
                name: m.block.id.name,
                loc: m.block.id.loc,
                errors: f m
            }
        .reduce ((a, b) -> a.concat b), []
        .reduce ((a, b) -> a.concat b), []
        .filter (n) -> n.errors.length

module.exports = get_flxs

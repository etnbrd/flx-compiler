#!/usr/bin/env coffee

parse = require('esprima').parse
prune = require '../src/pruner'
fs = require 'fs'

fmap = (f, v) ->
    if v
        v[f]
    else
        undefined

scoping = (scope) ->
    t = {
        name: String(fmap('name', scope.block.id)),
        flx: scope.flx.name,
        children: scope.childScopes.map(scoping),
        variables: scope.variables.map((n) -> n.name),
        references: scope.references.map (n) -> n.identifier.name
    }
    delete t.children if t.children.length == 0
    t

vizualize = (ast) ->
    fluxions = {}
    console.log '=========='
    for flxName, flx of ast.flx
        # console.log '=>', flxName
        fluxions[flxName] = []
        for output in flx.outputs
            messageComposition = []
            for depName, dep of output.dest.dependencies
                if String(dep.source.name) == flxName
                    # console.log '--->', depName
                    # console.log output.name
                    messageComposition.push depName

            fluxions[flxName].push { target: output.name, args: messageComposition}

    fluxions

main = (code) ->
    ast = prune(parse(code))
    fluxions = vizualize(ast)
    # console.log fluxions

    # fs.writeFile './bin/scopes.json', JSON.stringify(scoping(ast.scopes[0]), null, 4)
    fs.writeFile './bin/fluxions.json', JSON.stringify(fluxions, null, 4)
    console.log JSON.stringify(scoping(ast.scopes[0]), null, 4)
    # console.log scoping(ast.scopes[0])
    # console.log scoping(ast.scopes[1])

main fs.readFileSync('./examples/count3.js')

module.exports = main

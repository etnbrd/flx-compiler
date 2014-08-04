fs = require 'fs'
esprima = require 'esprima'

globals = (scope) ->
    name = (a) ->
        if a.identifier
            a.identifier.name
        else
            a.name

    names = (a) -> a.map name
    minus_array = (a, b) -> a.filter (e) -> b.indexOf(e) == -1
    minus_array names(scope.references), names(scope.variables.concat scope.block.id)

module.exports = globals

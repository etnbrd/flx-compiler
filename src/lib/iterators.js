module.exports = function iteratorFactory(types) {  
    return function iterator(c) {
        function handlerFactory(type) {
            return function handler(n) {
                if (!n.type)
                    throw errors.missingType(n);
                if (!!types[n.type] && types[n.type][type])
                    return types[n.type][type](n, c);
            };
        }

        return {
            enter: handlerFactory('enter'),
            leave: handlerFactory('leave')
        };
    };
}
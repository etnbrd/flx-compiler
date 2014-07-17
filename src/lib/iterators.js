var errors = require('./errors');

module.exports = function iteratorFactory(typesWalker) {
    return function iterator(context) {
        function handlerFactory(visitorEvent) {
            return function handler(node, parent) {
                if (!node.type)
                    throw errors.missingType(node);
                if (!!typesWalker[node.type] && typesWalker[node.type][visitorEvent])
                    return typesWalker[node.type][visitorEvent](node, parent, context);
            };
        }

        return {
            enter: handlerFactory('enter'),
            leave: handlerFactory('leave')
        };
    };
};

var errors = require('./errors');

module.exports = function iteratorFactory(typesWalker) {
    return function iterator(carriedDataContext) {
        function handlerFactory(visitorEvent) {
            return function handler(currentNode, parentNode) {
                if (!currentNode.type)
                    throw errors.missingType(currentNode);
                if (!!typesWalker[currentNode.type] && typesWalker[currentNode.type][visitorEvent])
                    return typesWalker[currentNode.type][visitorEvent](carriedDataContext, currentNode, parentNode);
            };
        }

        return {
            enter: handlerFactory('enter'),
            leave: handlerFactory('leave')
        };
    };
};

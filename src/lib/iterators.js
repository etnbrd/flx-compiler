var errors = require('./errors');

module.exports = function iteratorFactory(typesWalker) {
    return function iterator(carriedData) {
        function handlerFactory(visitorEvent) {
            return function handler(currentNode, previousNode) {
                if (!currentNode.type)
                    throw errors.missingType(currentNode);
                if (!!typesWalker[currentNode.type] && typesWalker[currentNode.type][visitorEvent])
                    return typesWalker[currentNode.type][visitorEvent](carriedData, currentNode, previousNode);
            };
        }

        return {
            enter: handlerFactory('enter'),
            leave: handlerFactory('leave')
        };
    };
};

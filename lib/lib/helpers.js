var _saltTrace = 1000;

function salt() {
  return _saltTrace++;
}

function hash(node, _salt) {
  return '' +
    node.loc.start.line +
    node.loc.start.column +
    node.loc.end.line +
    node.loc.end.column +
    '-' +
    (_salt || salt());
}

function generateFluxionName(name) {
  return name + '↠' + _saltTrace++;
  // This character means 'start', a fluxion name should'nt be representative of that, the output should.
}

function fluxionNameMatcher(matcher) {
  return function(name) {
    return name.split('↠')[0] === matcher;
  };
}

function isMatchingFluxionName(matcher, name) {
  return fluxionNameMatcher(matcher)(name);
}

function getValueFromMatchingFluxionNameKey(hash, name) {
  return hash[Object.keys(hash).filter(fluxionNameMatcher(name))[0]];
}

module.exports = {
  hash: hash,
  salt: salt,
  generateFluxionName: generateFluxionName,
  isMatchingFluxionName: isMatchingFluxionName,
  fluxionNameMatcher: fluxionNameMatcher,
  getValueFromMatchingFluxionNameKey: getValueFromMatchingFluxionNameKey
};

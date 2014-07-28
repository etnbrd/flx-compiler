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
  return '↠' + name;
  // TODO maybe, fluxion names shouldn't start with this character.
  // This character means 'start', a fluxion name should'nt be representative of that, the output should.
}

module.exports = {
  hash: hash,
  salt: salt,
  generateFluxionName: generateFluxionName
};

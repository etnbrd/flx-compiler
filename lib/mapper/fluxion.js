// ## Fluxion

var log = require('../lib/log');

// This object describe a fluxion

function Fluxion(name, ast, root) {
  // + The name of the fluxion is used to receives messages from other fluxions.
  this.name = name;
  // + A fluxion is an independent execution unit, therefor we link the code from the original AST.
  this.ast = ast;
  // + The code execution of a fluxion span over one or more function scopes.
  this.scopes = [];
  // + A fluxion sends messages to downstream fluxions, each stream of message to a downstream fluxion is represented here as an output.
  this.outputs = [];
  // + This fluxion receives messages from upstream fluxions.
  this.parents = [];
  // + Is this fluxion the root of the stream.
  this.root = root;
  // + The linker uses the function scope description to spot broken dependencies between fluxions.
  this.dependencies = {};

  // + Varaible dependencies are of three types : `signature`, `scope` and `sync`.
  this.signature = {};
  this.scope = {};
  this.sync = {};
}

Fluxion.prototype.enter = function () {
  log.enter('Enter flx ' + this.name);
  return this;
};

Fluxion.prototype.leave = function () {
  log.leave('Leave flx ' + this.name);
  return this;
};

Fluxion.prototype._registerScopes = function(scopes) {
  scopes.forEach(function(n) {
    this.scopes.push(n);
  }.bind(this));
  return this;
};

Fluxion.prototype._registerParent = function (parent, output) {
  this.parents.push({parent: parent, output: output});
  return this;
};

Fluxion.prototype._registerOutput = function (output) {
  log.info(this.name + ' // ' + output.source.name +  ' -> ' + output.dest.name);
  this.outputs.push(output);
  this.currentOutput = output;
  return this;
};

module.exports = Fluxion;
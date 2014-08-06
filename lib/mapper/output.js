// ## Output

// The compiler breaks a program into fluxion along rupture points (asynchronous calls).
// At a rupture point, the fluxion sends a message to the downstream fluxion to replace the asynchronous call.
// The output describes the stream between these two fluxions.

var log = require('../lib/log');

function Output(name, type, params, sourceFlx, destFlx) {
  function formatParam(param) {
    return {
      ast: param,
      name: param.name
    };
  }

  // + The name of the destination fluxion.
  this.name = name;
  // + The type of the rupture points : start, or post
  this.type = type;
  // + The parameters to send for the destination fluxion to call either the callback in a start rupture point, or the asynchronous call in a post rupture point.
  this.params = params.map(formatParam);
  // + The upstream fluxion.
  this.source = sourceFlx;
  // + The downstream fluxion.
  this.dest = destFlx;
  // + The signature of an output is the variables the upstream fluxion needs to send to make sure the scopes of every downstream fluxions are consistent.
  this.signature = {};
}

Output.prototype.registerSign = function (id) {
  log.sig(id.name + log.grey(' // ' + this.source.name + ' -> ' + this.dest.name));
  this.signature[id.name] = {
    name: id.name,
    id: id,
    source: this.source,
    dest: this.dest
  };
};

module.exports = Output;
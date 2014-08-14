function getLocs(s) {
  if (typeof s.map !== 'function')
    return s;

  return s.map(function(i) {
    if (i.identifier)
      return i.identifier.loc;
    if (i.node)
      return i.node.loc;
    if (i.loc)
      return i.loc;

    return s;
  });
}

function tag(tagsByLine, type, loc) {
  tagsByLine[loc.start.line - 1]. push({ tagname: type, start: true, pos: loc.start.column});
  tagsByLine[loc.end.line - 1]. push({ tagname: type, start: false, pos: loc.end.column});
}

function tagCurr(a, b) {
  return function(c) {
    return tag(a, b ,c);
  };
}

function graph(ctx, code) {
  code = String(code).split('\n');
  var tagsByLine = [];

  for (var index = 0, length = code.length; index < length; ++index)
    tagsByLine[index] = [];

  var variables = ctx.scopes
    .map(function (s) { return s.variables; })
    .reduce(function(a, b) { return a.concat(b); }, [])
    .map(function (s) { return { name: s.name, identifiers: getLocs(s.identifiers), references: getLocs(s.references), defs: getLocs(s.defs) }; })
    ;

  var references = ctx.scopes
    .map(function (s) { return s.references; })
    .reduce(function(a, b) { return a.concat(b); }, [])
    .map(function (s) { return s.identifier.loc; })
    ;

    references.forEach(tagCurr(tagsByLine, 'ref'));

  variables
    .forEach(function (s) {
      s.identifiers.forEach(tagCurr(tagsByLine, 'identifier'));
      s.references.forEach(tagCurr(tagsByLine, 'reference'));
      s.defs.forEach(tagCurr(tagsByLine, 'defs'));
    })
    ;

  tagsByLine = tagsByLine.map(function(l) {
    return l.sort(function(a, b) {
      if (a.pos < b.pos) return -1;
      if (a.pos > b.pos) return 1;
      if (!a.start && b.start) return -1;
      if (a.start && !b.start) return 1;

      return 0;
    });
  });

  var taggedCode = [];
  for (var i = 0, lt = code.length; i < lt; ++i) {
    taggedCode[i] = '';
    for (var j = 0, l = code[i].length, k = 0, a = tagsByLine[i].length; j < l; ++j) {
      while (k < a && tagsByLine[i][k].pos === j && !tagsByLine[i][k].start) {
        taggedCode[i] += '</span>';
        ++k;
      }

      while (k < a && tagsByLine[i][k].pos === j && tagsByLine[i][k].start) {
        taggedCode[i] += '<span class="' + tagsByLine[i][k].tagname + '">';
        ++k;
      }

      taggedCode[i] += code[i][j];
      // console.log(taggedCode[i]);
    }
  }

  // console.log(tagsByLine);
  // console.log(variables);
  // console.log(references);
  return taggedCode.join('\n');
}

// isomorphic JS
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
  module.exports = graph;

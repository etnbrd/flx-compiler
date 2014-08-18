var d3 = require('d3');

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
    }
  }

  var usedVariables = ctx.scopes
    .map(function (s) { return s.references; })
    .reduce(function(a, b) { return a.concat(b); }, [])
    .map(function (s) {
      return {
        ref: s.identifier.loc.start.line,
        src: s.from.variables
          .filter(function(d) { return d.name === s.identifier.name; })
          .map(function(d) { return d.identifiers; })
          .reduce(function(a, b) { return a.concat(b); }, [])
          .map(function(d) { return d.loc.start.line; })
          [0]
      };
    })
    .filter(function (s) { return undefined !== s.src && s.ref !== s.src; })
    ;

  var lines = [[]];
  for (var i = 0, l = code[i].length; i < l; ++i)
    lines[i+1] = [];

  usedVariables.forEach(function(s) { lines[s.ref].push(s.src); });

  var margin = {top: 10, right: 40, bottom: 10, left: -100},
      width = 200 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  var cluster = d3.layout.cluster()
      .size([height, width])
      // .sort(function(a, b) { return d3.ascending(a.name, b.name); })
      .value(function(d) { return 1; });

  var bundle = d3.layout.bundle();

  var line = d3.svg.line()
      .interpolate('bundle')
      .tension(.85)
      .x(function(d) { return d.y; })
      .y(function(d) { return d.x; });

  var svg = d3.select('body').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var packages = {

    root: function(lines) {
      var nodes = [];

      lines.forEach(function(d, i) {
        nodes[i] = d;
      });

      return { name: '', children: nodes };
    },

    // Return a list of dependencies for the given array of nodes.
    dependencies: function(nodes) {
      var dependencies = [];

      nodes.forEach(function(d, t) {
        if (!d.children)
            d.forEach(function(s) {
              dependencies.push({source: nodes[s], target: nodes[t]});
            });
      });

      return dependencies;
    }
  };

  console.log(lines);
  var nodes = cluster.nodes(packages.root(lines)),
      links = packages.dependencies(nodes);

  svg.selectAll('.link')
      .data(bundle(links))
    .enter().append('path')
      .attr('class', 'link')
      .attr('d', line);

  svg.selectAll('.node')
      .data(nodes)
    .enter().append('g')
      .attr('class', 'node')
      .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; })
    .append('text')
      .attr('dx', 8)
      .attr('dy', '.31em')
      .text(function(d) { return d.key; });

  return '<svg xmlns=\'http://www.w3.org/2000/svg\' version=\'1.1\'>' + d3.select('svg').html() + '</svg>\n'
    + '<code><pre>' + taggedCode.join('\n') + '</pre></code>';
}

// isomorphic JS
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
  module.exports = graph;

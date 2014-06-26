module.exports = {
  toString: inspect,
  ctxToGraph: ctxToGraph
}

function safe(str) {

  return ("i" + str).replace(/\+/g, 'plus')
                    .replace(/\-\_/g, 'minus_')
                    .replace(/\-/g, '_')
                    .replace(/>/g, '')
                    .replace(/\//g, '')
                    .replace(/:/g, '')
                    .replace('.', '_')
}

function edge(edge) {
  if (edge.id.toString() === "[object Object]") {
    console.log("this id is an object, should though", edge.type);
  }

  function flatten(n) {
    return n.name;
  }

  edge.params = edge.params || [];

  var params = edge.params.map(flatten);
  var signature = Object.keys(edge.signature);
  var length = params.length + signature.length

  return safe(edge.id) + " -> " + safe(edge.to) + " [label=<<table border=\"0\" cellspacing=\"0\" cellborder=\"0\"><tr><td rowspan=\"" + length + "\" width=\"1\" height=\"" + (15 * length) + " \" bgcolor=\"black\" fixedsize=\"true\"></td><td align=\"left\">" + params.join(',</td></tr><tr><td align=\"left\">') + "</td></tr><tr><td align=\"left\"><font color=\"gray\">" + signature.join(',</font></td></tr><tr color=\"grey\"><td align=\"left\"><font color=\"gray\">') + "</font></td></tr></table>>]";
}

function node(node) {
  return safe(node.id) + " [label=<" + node.name + "<br/><font color=\"#404040\" point-size=\"5\">" + node.id + "</font>>]";
}

function graph(n, e, prefix) {
  var _p = prefix || "";

  return "" +
    n.reduce(function(output, n) { // nodes
      return output += _p + node(n) + "\n";
    }, "") + "\n" +
    e.reduce(function(output, e) { // edges
      return output += _p + edge(e) + "\n";
    }, "");
}

function cluster(g, prefix) {
  var _p = prefix || "";
  var output = [
      _p + "subgraph cluster_" + safe(g.name) + " {\n",
      _p + " label = <" + g.name + "<br/><font color=\"#404040\" point-size=\"5\">" + g.id + "</font>>;\n\n"
    ].join("\n") +
    graph(g.nodes, g.edges, prefix + "  ") +
    _p + "}\n";
  return output;
}

function digraph(graphs) {
  return graphs.reduce(function(output, graph) {
    return output += cluster(graph, "  ") + "\n";
  }, [
    'digraph G {\n',
    '  graph [ fontname="HelveticaNeue-Thin", fontcolor=black, fontsize=10, rankdir=LR ];',
    '  node [ fontname="HelveticaNeue-Thin", fontcolor=black, fontsize=10, penwidth=0.5 shape=circle, fixedsize=true, width=1.2, height=1.2 ];',
    '  edge [ fontname="HelveticaNeue-Thin", fontcolor=black, fontsize=10, penwidth=0.5 splines=line, arrowsize=0.7 ];\n\n'
  ].join("\n")) + "}\n";
}

function _graph(g) {
  return {
    name: g.name,
    id: g.id || g.name,
    nodes: g.nodes,
    edges: g.edges
  }
}

function inspect() {

  var that = this;

  if (Object.prototype.toString.call(this) === "[object Array]") {
    var output = digraph(Object.keys(that).reduce(function(graphs, id) { var graph = that[id];
        if(id !== 'toString' && id !== 'inspect')
          graphs.push(_graph(graph));
        return graphs;
      }, [])
    )
    return output;
  } else {
    return digraph([_graph(this)]);
  }
}

function ctxToGraph(ctx, name) {


  var _graph = {
    nodes: [],
    edges: [],
    name: name
  }

  function toName(id) {
    return id.split('-')[0];
  }

  for (var _flx in ctx._flx) { var flx = ctx._flx[_flx];

    _graph.nodes.push({
      name: toName(flx.name),
      id: flx.name
    })

    if (flx.outputs && flx.outputs.length > 0) flx.outputs.map(function(o) {


    console.log(">>>>> HERE " + o.name + " <<<<<<");
    console.log(o.params);

      _graph.edges.push({
        id: flx.name,
        to: o.name,
        signature: o.signature,
        params: o.params
      })
    })
  }

  return inspect.call(_graph);

}

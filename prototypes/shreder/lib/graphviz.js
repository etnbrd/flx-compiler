module.exports = {
  toString: inspect
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

  return safe(edge.id) + " -> " + safe(edge.to) + " [label=<<table border=\"0\" cellspacing=\"0\" cellborder=\"0\"><tr><td align=\"left\">" + Object.keys(edge.signature).join(',</td></tr><tr><td align=\"left\">') + "</td></tr></table>>]";
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
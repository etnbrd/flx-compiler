function safe(str) {

  str = "i" + str;

  str = str.replace(/\+/g, 'plus');
  str = str.replace(/\-\_/g, 'minus_');
  str = str.replace(/\-/g, '_');
  str = str.replace(/>/g, '');

  return str;
}

function edge(edge) {
  if (edge.id.toString() === "[object Object]") {
    console.log("this id is an object, should though", edge.type);
  }

  return safe(edge.id) + " -> " + safe(edge.to) + " [label=\"" + edge.type + "\"]";
}

function node(node) {
  return safe(node.id) + " [label=<" + node.name + "<br/><font color=\"#404040\" point-size=\"5\">" + node.kind + (node.version ? ("[" + node.version + "]") : "") + "</font><br/><font color=\"#404040\" point-size=\"5\">" + node.id + "</font>>]";
}

function graph(n, e, prefix) {
  var _output = "";
  var _p = prefix || "";

  // console.log(" >> ", n, e);

  for (var i = 0; i < n.length; i++) {
    _output += _p + node(n[i]) + "\n";
  };

  _output += "\n";

  for (var i = 0; i < e.length; i++) {
    _output += _p + edge(e[i]) + "\n";
  };

  return _output
}

function cluster(g, prefix) {
  var _p = prefix || "";
  var _output = [
    _p + "subgraph cluster_" + safe(g.name) + " {\n",
    _p + " label = <" + g.name + "<br/><font color=\"#404040\" point-size=\"5\">" + g.id + "</font>>;\n\n"
  ].join("\n");
  _output += graph(g.nodes, g.edges, prefix + "  ");
  _output += _p + "}\n";

  return _output;
}

function digraph(graphs) {
  var _output = [
    'digraph G {\n',
    '  graph [ fontname="HelveticaNeue-Thin", fontcolor=black, fontsize=10 ];',
    '  node [ fontname="HelveticaNeue-Thin", fontcolor=black, fontsize=10, penwidth=0.5 shape=circle, fixedsize=true, width=1.2, height=1.2 ];',
    '  edge [ fontname="HelveticaNeue-Thin", fontcolor=black, fontsize=10, penwidth=0.5 splines=line, arrowsize=0.7 ];\n\n'
  ].join("\n");

  for (var i = 0; i < graphs.length; i++) {
    _output += cluster(graphs[i], "  ") + "\n";
  }

  _output += "}\n";

  return _output;
}

// TODO do multiInspect and Inspect instead of depTree, resTree and redTree

function depTree() {

  var graphs = [];

  for (var i in this) {

    var graph = {
      name: this[i].name,
      id: this[i].id,
      nodes: [],// this[i].ids,
      edges: [] // this[i].dep
    }

    if(i === 'toString' || i === 'inspect')
      continue;

    // console.log(this[i].nodes.length);

    for (var j = 0; j < this[i].nodes.length; j++) {
      graph.nodes.push(this[i].nodes[j]);
    };

    for (var j = 0; j < this[i].deps.length; j++) {
      var present = true;
      // console.log(this[i].dep[j]);
      graph.edges.push(this[i].deps[j]);

      for (var k = 0; k < this[i].nodes.length; k++)
        if ( this[i].deps[j].name === this[i].nodes[k].id )
          present = false;
    };



    graphs.push(graph);
  };

  return digraph(graphs);
}

function resTree() {
  var graph = {
    name: this.name,
    id: this.id,
    nodes: this.nodes,
    edges: this.deps
  }

  // for (var j = 0; j < this[i].nodes.length; j++) {
  //   graph.nodes.push(this[i].nodes[j]);
  // };

  // for (var j = 0; j < this[i].dep.length; j++) {
  //   var present = true;
  //   // console.log(this[i].dep[j]);
  //   graph.edges.push(this[i].dep[j]);

  //   for (var k = 0; k < this[i].nodes.length; k++)
  //     if ( this[i].dep[j].name === this[i].nodes[k].id )
  //       present = false;
  // };

  return digraph([graph]);
}

function redTree() {
  var _ids = [];

  for (var j = 0; j < this.dep.length; j++) {
    var index = undefined;
    for (var k = 0; k < this.ids.length; k++) {
      if(this.dep[j].name === this.ids[k].id) {
        index = k;
      }
    }

    _ids.push(index ? this.ids[index] : {
      name: safe(this.dep[j].name),
      id: this.dep[j].name,
    });
  };

  return digraph([{
    name: this.name,
    nodes: _ids,
    edges: this.dep
  }]);
}

module.exports = {
  depTree : depTree,
  resTree : resTree,
  redTree : redTree
}
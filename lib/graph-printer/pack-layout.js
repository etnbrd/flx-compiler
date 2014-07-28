var labelSize = 10,
    lineSize = 10,
    maxWidth = 400,
    padding = {
      top: 5,
      bottom: 5,
      left: 5,
      right: 5
    },
    margin_ = {
      top: 5,
      bottom: 5,
      left: 5,
      right: 5
    };


// The box model :
// margin is outside the box containing a scope
// padding is inside the box containing a scope
// the indicate the space between a parent scope and the child scopes.


d3.layout.squarepack = function() {
  var hierarchy = d3.layout.hierarchy(),
      padding = 0,
      size = [1, 1],
      radius;

  function pack(d, i) {

    var nodes = hierarchy.call(this, d, i),
        root = nodes[0];

    // Recursively compute the layout.
    root.y = 20; // TODO expose this
    d3_layout_hierarchyVisitAfter(root, function(d) { d.x = 20; }); // TODO expose this

    d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
    d3_layout_hierarchyVisitBefore(root, d3_layout_computePosition);

    return nodes;
  }

  pack.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return pack;
  };

  pack.radius = function(_) {
    if (!arguments.length) return radius;
    radius = _ == null || typeof _ === "function" ? _ : +_;
    return pack;
  };

  pack.padding = function(_) {
    if (!arguments.length) return padding;
    padding = +_;
    return pack;
  };

  return d3_layout_hierarchyRebind(pack, hierarchy);
};

function d3_layout_computePosition(node) {

  // LEAF
  if (!(nodes = node.children)) {
    return;
  }



  // console.log(lineSize, node.variables, node.size)

  nodes.reduce(function(prev, node) {
    node.y = prev;
    return prev + node.height + margin_.bottom + padding.bottom;
  }, node.y + (lineSize * node.variables) + margin_.top + padding.top)

}

function d3_layout_packSiblings(node) {

  // LEAF
  if (!(nodes = node.children)) {
    node.size = 30;
    return;
  }

  var totalSize = 0;

  var childSize = nodes.reduce(function(size, node) {
    return size += node.height;
  }, 0);

  node.height = padding.top + margin_.top + labelSize + lineSize * node.variables + node.children.length * (margin_.top + margin_.bottom) + (childSize || 0) + padding.bottom + margin_.bottom;
  node.width = maxWidth - node.depth * (padding.left + padding.right + margin_.left + margin_.right);
  node.x = node.depth * (padding.left + margin_.left);
}






// DEPENDENCIES

function d3_layout_hierarchyRebind(object, hierarchy) {
  d3.rebind(object, hierarchy, "sort", "children", "value");
  object.nodes = object;
  object.links = d3_layout_hierarchyLinks;
  return object;
}
function d3_layout_hierarchyVisitBefore(node, callback) {
  var nodes = [ node ];
  while ((node = nodes.pop()) != null) {
    callback(node);
    if ((children = node.children) && (n = children.length)) {
      var n, children;
      while (--n >= 0) nodes.push(children[n]);
    }
  }
}
function d3_layout_hierarchyVisitAfter(node, callback) {
  var nodes = [ node ], nodes2 = [];
  while ((node = nodes.pop()) != null) {
    nodes2.push(node);
    if ((children = node.children) && (n = children.length)) {
      var i = -1, n, children;
      while (++i < n) nodes.push(children[i]);
    }
  }
  while ((node = nodes2.pop()) != null) {
    callback(node);
  }
}
function d3_layout_hierarchyChildren(d) {
  return d.children;
}
function d3_layout_hierarchyValue(d) {
  return d.value;
}
function d3_layout_hierarchySort(a, b) {
  return b.value - a.value;
}
function d3_layout_hierarchyLinks(nodes) {
  return d3.merge(nodes.map(function(parent) {
    return (parent.children || []).map(function(child) {
      return {
        source: parent,
        target: child
      };
    });
  }));
}
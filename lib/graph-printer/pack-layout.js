// TODO expose all these variables.
var labelSize = 25,
    lineSize = 20,
    separator = 5,
    maxWidth = 400,
    padding = {
      top: 0,
      bottom: 5,
      left: 5,
      right: 5
    },
    margin_ = {
      top: 5,
      bottom: 0,
      left: 0,
      right: 0
    };


// The box model :
// margin is outside the box containing a scope
// padding is inside the box containing a scope
// the indicate the space between a parent scope and the child scopes.


squarepack = function() {
  var hierarchy = d3.layout.hierarchy(),
      padding = 0,
      size = [1, 1],
      radius;

  function pack(d, i) {

    var nodes = hierarchy.call(this, d, i),
        root = nodes[0];

    // Recursively compute the layout.
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

function d3_layout_packSiblings(node) {

  var nodes;

  node.height = padding.top + labelSize + lineSize * node.variables.length + separator + padding.bottom;
  node.width = maxWidth - node.depth * (padding.left + margin_.left + padding.right + margin_.right);
  node.x = node.depth * (padding.left + margin_.left);


  // PARENTS
  if ((nodes = node.children)) {
    node.height += nodes.reduce(function(size, node) {
      return size += margin_.top + node.height + margin_.bottom;
    }, 0);
  }
}

function d3_layout_computePosition(root) {

  // LEAF
  if (!(nodes = root.children)) {
    return;
  }

  root.y = root.y || 0;

  nodes.reduce(function(prev, node) {
    node.y = prev;
    return prev + margin_.top + node.height + margin_.bottom;
  }, root.y + padding.top + labelSize + (lineSize * root.variables.length) + separator + margin_.top)

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

// isomorphic JS
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
  module.exports = squarepack;
else
  d3.layout.squarepack = squarepack;
d3.layout.squarepack = function() {
  var hierarchy = d3.layout.hierarchy().sort(d3_layout_packSort),
      padding = 0,
      size = [1, 1],
      radius;

  function pack(d, i) {

    console.log(">> ", d, i);

    var nodes = hierarchy.call(this, d, i),
        root = nodes[0];
        // w = size[0],
        // h = size[1];
        // r = radius == null ? Math.sqrt : typeof radius === "function" ? radius : function() { return radius; };

    // Recursively compute the layout.
    root.y = 20; // TODO expose this
    d3_layout_hierarchyVisitAfter(root, function(d) { d.width = 200; }); // TODO expose this
    d3_layout_hierarchyVisitAfter(root, function(d) { d.x = 20; }); // TODO expose this

    // d3_layout_hierarchyVisitAfter(root, function(d) { d.y = 20; }); // TODO default dummy values
    d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
    d3_layout_hierarchyVisitBefore(root, computePosition);

    // When padding, recompute the layout using scaled padding.
    // if (padding) {
    //   var dr = padding * (radius ? 1 : Math.max(2 * root.r / w, 2 * root.r / h)) / 2;
    //   d3_layout_hierarchyVisitAfter(root, function(d) { d.r += dr; });
    //   d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
    //   d3_layout_hierarchyVisitAfter(root, function(d) { d.r -= dr; });
    // }

    // Translate and scale the layout to fit the requested size.
    // d3_layout_packTransform(root, w / 2, h / 2, radius ? 1 : 1 / Math.max(2 * root.r / w, 2 * root.r / h));

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

function d3_layout_packSort(a, b) {
  return a.value - b.value;
}

function d3_layout_packInsert(a, b) {
  var c = a._pack_next;
  a._pack_next = b;
  b._pack_prev = a;
  b._pack_next = c;
  c._pack_prev = b;
}

function d3_layout_packSplice(a, b) {
  a._pack_next = b;
  b._pack_prev = a;
}

function d3_layout_packIntersects(a, b) {
  var dx = b.x - a.x,
      dy = b.y - a.y,
      dr = a.r + b.r;
  return .999 * dr * dr > dx * dx + dy * dy; // relative error within epsilon
}

function computePosition(node) {

  console.log(">> " + node.name, node.children);

  // LEAF
  if (!(nodes = node.children)) {
    return;
  }

  nodes.reduce(function(prev, node) {
    // console.log(">> " + node.name + " pos : " + position + prev.y);
    node.y = prev;
    return prev + node.size + 5;
  }, node.y + (5*node.variables) + 5)

}

function d3_layout_packSiblings(node) {

  // LEAF
  if (!(nodes = node.children)) {
    node.size = 30;
    return;
  }

  var nodes,
      xMin = Infinity,
      xMax = -Infinity,
      yMin = Infinity,
      yMax = -Infinity,
      a, b, c, i, j, k, n;

  var totalSize = 0;

  node.size = 5 * node.variables + 10 + node.children.length * 5 + nodes.reduce(function(size, node) {
    return size += node.size;
  }, 0);

  // function bound(node) {
  //   xMin = Math.min(node.x - node.r, xMin);
  //   xMax = Math.max(node.x + node.r, xMax);
  //   yMin = Math.min(node.y - node.r, yMin);
  //   yMax = Math.max(node.y + node.r, yMax);
  // }

  // // Create node links.
  nodes.forEach(d3_layout_packLink);



  // // Create first node.
  // a = nodes[0];
  // a.x = -a.r;
  // a.y = 0;
  // bound(a);

  // // Create second node.
  // if (n > 1) {
  //   b = nodes[1];
  //   b.x = b.r;
  //   b.y = 0;
  //   bound(b);

  //   // Create third node and build chain.
  //   if (n > 2) {
  //     c = nodes[2];
  //     d3_layout_packPlace(a, b, c);
  //     bound(c);
  //     d3_layout_packInsert(a, c);
  //     a._pack_prev = c;
  //     d3_layout_packInsert(c, b);
  //     b = a._pack_next;

  //     // Now iterate through the rest.
  //     for (i = 3; i < n; i++) {
  //       d3_layout_packPlace(a, b, c = nodes[i]);

  //       // Search for the closest intersection.
  //       var isect = 0, s1 = 1, s2 = 1;
  //       for (j = b._pack_next; j !== b; j = j._pack_next, s1++) {
  //         if (d3_layout_packIntersects(j, c)) {
  //           isect = 1;
  //           break;
  //         }
  //       }
  //       if (isect == 1) {
  //         for (k = a._pack_prev; k !== j._pack_prev; k = k._pack_prev, s2++) {
  //           if (d3_layout_packIntersects(k, c)) {
  //             break;
  //           }
  //         }
  //       }

  //       // Update node chain.
  //       if (isect) {
  //         if (s1 < s2 || (s1 == s2 && b.r < a.r)) d3_layout_packSplice(a, b = j);
  //         else d3_layout_packSplice(a = k, b);
  //         i--;
  //       } else {
  //         d3_layout_packInsert(a, c);
  //         b = c;
  //         bound(c);
  //       }
  //     }
  //   }
  // }

  // // Re-center the circles and compute the encompassing radius.
  // var cx = (xMin + xMax) / 2,
  //     cy = (yMin + yMax) / 2,
  //     cr = 0;
  // for (i = 0; i < n; i++) {
  //   c = nodes[i];
  //   c.x -= cx;
  //   c.y -= cy;
  //   cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
  // }
  // node.r = cr;

  // Remove node links.
  nodes.forEach(d3_layout_packUnlink);
}

function d3_layout_packLink(node) {
  node._pack_next = node._pack_prev = node;
}

function d3_layout_packUnlink(node) {
  delete node._pack_next;
  delete node._pack_prev;
}

function d3_layout_packTransform(node, x, y, k) {
  var children = node.children;
  node.x = (x += k * node.x);
  node.y = (y += k * node.y);
  node.r *= k;
  if (children) {
    var i = -1, n = children.length;
    while (++i < n) d3_layout_packTransform(children[i], x, y, k);
  }
}

function d3_layout_packPlace(a, b, c) {
  var db = a.r + c.r,
      dx = b.x - a.x,
      dy = b.y - a.y;
  if (db && (dx || dy)) {
    var da = b.r + c.r,
        dc = dx * dx + dy * dy;
    da *= da;
    db *= db;
    var x = .5 + (db - da) / (2 * dc),
        y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
    c.x = a.x + x * dx + y * dy;
    c.y = a.y + x * dy - y * dx;
  } else {
    c.x = a.x + db;
    c.y = a.y;
  }
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
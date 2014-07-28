function graph(ctx, window) {


  var pack = d3.layout.squarepack();
      // TODO access exposed variables.
      // .padding(20)
      // .size([diameter - margin, diameter - margin])
      // .value(function(d) { return 30; })

  var svg = d3.select("body").append("svg")
      .attr("width", 2000)
      .attr("height", 2000)


  var nodes = pack.nodes(ctx);

  var scopes = svg.selectAll(".scope")
      .data(nodes)
      .enter();

  var groups = scopes.append("g").attr("class", "scope");

  groups  .append("rect")
          .attr("class", function(d) { return d.parent ? d.children ? "scope" : "scope scope-leaf" : "scope scope-root"; })
          .attr("stroke", "black")
          .attr("stroke-wdith", "1px")
          .attr("fill", "none")
          .attr("width", function(d) { return d.width; })
          .attr("height", function(d) { return d.height; })
          .attr("x", function(d) { return d.x })
          .attr("y", function(d) { return d.y })

  groups  .append("text")
          .attr("class", "labelName")
          .attr("x", function(d) { return d.x })
          .attr("y", function(d) { return d.y })
          .attr("dx", function(d) { return "5px" })
          .attr("dy", function(d) { return "20px" })
          .text(function(d) { return d.name });

  groups  .append("g")
          .attr("class", "variables")
          .attr("transform", function(d) {
            return "translate(" + d.x + ", " + (d.y + 25) +")";
          })
          .selectAll("text").data(function(d) { return d.variables; }).enter()
          .append("text")
          .attr("x", function(d) { return 0 })
          .attr("y", function(d, i) { return 20 * i })
          .attr("dx", function(d) { return "5px" })
          .attr("dy", function(d) { return "20px" })
          .text(function(d) { return d; });
}

// isomorphic JS
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
  module.exports = graph;
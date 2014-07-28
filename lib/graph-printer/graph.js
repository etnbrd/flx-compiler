var margin = 20,
    diameter = 700;

var color = d3.scale.linear()
    .domain([-1, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

var pack = d3.layout.squarepack()
    .padding(20)
    .size([diameter - margin, diameter - margin])
    .value(function(d) { return 30; })

var svg = d3.select("body").append("svg")
    .attr("width", 1200)
    .attr("height", diameter)
    .append("g")
    // .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

d3.json("ctx-mock.json", function(err, root) {
  if (err) return console.error(err);
  else return graph(root);
});


var seed = 2;

function graph(ctx) {

  var nodes = pack.nodes(ctx);

  var circle = svg.selectAll("rect")
      .data(nodes)
      .enter()
        .append("rect")
          .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node-leaf" : "node node-root"; })
          .style("fill", function(d) { return color(seed++); })
          .attr("width", function(d) { return d.width; })
          .attr("height", function(d) { return d.height; })
          .attr("x", function(d) { return d.x })
          .attr("y", function(d) { return d.y })

        .append("text")
          .attr("x", function(d) { return d.x })
          .attr("y", function(d) { return d.y })
          .attr("font-size", "1em")
          .text(function(d) { return "label"; });

}
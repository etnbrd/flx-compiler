var fs = require("fs")
,   tests = require("./tests")
;

function generateRoadmap() {
  var result = tests.counts.reduce(function(prev, test, i) {

    try {
      var sourceFile = fs.readFileSync("examples/" + test.name + ".js");

      var source = [
        "The source program is in `examples/" + test.name + ".js` : ",
        "\n```",
        sourceFile,
        "```\n",
      ].join('\n');


      try {    
        var compileFile = fs.readFileSync("results/" + test.name + ".js");
        var compile = [
          "The compiled result is in `results/" + test.name + ".js` : ",
          "\n```",
          compileFile,
          "```\n\n"
          ].join('\n');
      } catch (e) {
        var compile = "The result has not yet be implemented\n"
      }

    } catch (e) {
      var source = "the test has not yet be implemented\n";
      var compile = "";
    }
    

    test.desc = test.desc.replace(/(^|\n)[ ]+/g, '$1');

    var result = [
      "### Problem #" + (1 + i),
      "\n",
      test.desc,
      "\n",
      source,
      compile,
    ].join('\n');

    return prev + result

  }, "");

  fs.writeFileSync("roadmap.md", result);
}

module.exports = generateRoadmap;
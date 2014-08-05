var fs = require("fs")
,   yaml = require('js-yaml')
;

var tests = yaml.safeLoad(fs.readFileSync(__dirname + '/tests.yml', 'utf8'));
var todos = yaml.safeLoad(fs.readFileSync(__dirname + '/../todos.yml', 'utf8'));

function generateTodo(todo) {
  return "+ " + todo.replace(/\n/g, '\n  ');
}

function generateTest(test) {

  var sourceFile = "examples/" + test.name + ".js",
      compileJsFile = "results/" + test.name + ".js",
      compileFlxFile = "results/" + test.name + ".flx";

  if (fs.existsSync(sourceFile)) {
    var source = [
      "The source program is in `examples/" + test.name + ".js` : ",
      "\n```",
      fs.readFileSync(sourceFile),
      "```\n",
    ].join('\n');

    if (fs.existsSync(compileJsFile)) {
      var compile = [
        "The compiled result is in `results/" + test.name + ".js` : ",
        "\n```",
        fs.readFileSync(compileJsFile),
        "```\n\n",
        "The fluxionnal result is in `results/" + test.name + ".flx` : ",
        "\n```",
        fs.readFileSync(compileFlxFile),
        "```\n\n"
        ].join('\n');
    } else {
      var compile = "The result has not yet be implemented\n";
    }

  } else {
    var source = "the test has not yet be implemented\n";
    var compile = "";
  }

  test.desc = test.desc.replace(/(^|\n)[ ]+/g, '$1');

  return [
    "### " + test.name,
    "\n",
    test.desc,
    "\n",
    source,
    compile,
  ].join('\n');
}

function generateRoadmap() {

  fs.writeFileSync('roadmap.md', todos.todos.reduce(function(prev, todo) {
      return prev + generateTodo(todo);
    }, '# Todos \n\n') + '\n\n' +
    Object.keys(tests).reduce(function(prev, categorie) {
    return prev + tests[categorie].reduce(function(prev, test, i) {
      return prev + generateTest(test);
    }, "\n## " + categorie + "\n\n"); 
  }, '# Tests \n\n'));
}

module.exports = generateRoadmap;
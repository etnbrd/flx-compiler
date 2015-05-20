var fs = require("fs");

function writeFile(name, data, ext) {
  var path = name + "." + (ext || "dot") // TODO PLEASE STOP MURDURING CODE LIKE THAT

  process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m ' + path);
  fs.writeFileSync(path, data);
  console.log('  \x1B[1m\x1B[32m✓\x1B[39m\x1B[22m');
}

module.exports = {
  writeFile: writeFile
}
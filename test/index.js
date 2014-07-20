require('blanket')({
  pattern: function (filename) {
    return !/node_modules/.test(filename);
  }
});

var fs = require('fs'),
    t = require('./tools'),
    assert = require('assert'),
    tests = require('./tests'),
    generateRoadmap = require('./genRM');

before(function(done) {
  fs.mkdir('results', done);
});

describe('Compilation', function () {
  describe('Problem #0 : \n', function () {
    it('source and result should be different', function () {
      var s = t.read('compile.js');
      assert.notEqual(s, t.compile(s, 'compile.js'));
    });
  });

  tests.counts.forEach(function(test, index) {
    describe('Problem #' + (index + 1) + " : \n", function() {
      it(test.desc, function (done) {
        var p = t.compileAndMock(test.name + '.js');
        var runExpectations = function (index) {
          return function () {
            if (index >= test.expectations.length)
              done();
            else
              p
                .get('/')
                .expect(test.expectations[index])
                .end(runExpectations(index + 1));
          };
        };

        runExpectations(0)();
      });
    });
  });

  tests.requires.forEach(function(test, index) {
    describe('Require : ' + test.name + " : \n", function() {
      it(test.desc, function (done) {
        var compiledCode = t.compile(t.read(test.name + '.js'), test.name + '.js');
        var flxRegisterMatcher = /flx.register\('(.+?)'/g

        var flxs = [];
        while ((arr = flxRegisterMatcher.exec(compiledCode)) !== null) {
          flxs.push(arr[1]);
        }

        assert.deepEqual(test.expectations, flxs);
        done();
      });
    });
  });
});

after(generateRoadmap);
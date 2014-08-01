require('blanket')({
  pattern: function (filename) {
    return !/node_modules/.test(filename) && /lib/.test(filename);
  }
});

var fs = require('fs'),
    t = require('./tools'),
    assert = require('assert'),
    yaml = require('js-yaml'),
    generateRoadmap = require('./genRM'),
    h = require('../lib/lib/helpers');

var tests = yaml.safeLoad(fs.readFileSync(__dirname + '/tests.yml', 'utf8'));

// before(function(done) {
//   fs.mkdir('results', function(e) {
//     if (e && e.code !== "EEXIST")
//       throw e;
//     done();
//   });
// });

describe('Compilation', function () {
  describe('Problem #0 : \n', function () {
    it('source and result should be different', function () {
      var s = t.read('compile.js');
      assert.notEqual(s, t.compile(s, 'compile.js'));
    });
  });

  tests.counts.forEach(function(test, index) {
    if(test.disable === true)
      return;

    describe('Problem #' + (index + 1) + ' : \n', function() {
      it(test.desc, function (done) {
        function runExpectations (index) {
          return function () {
            if (index >= test.expectations.length)
              done();
            else
              p
                .get('/')
                .expect(test.expectations[index])
                .end(runExpectations(index + 1));
          };
        }

        var p = t.compileAndMock(test.name + '.js');
        runExpectations(0)();
      });
    });
  });

  tests.startFluxions.forEach(function(test, index) {
    describe('startFluxions : ' + test.name + ' : \n', function() {
      it(test.desc, function (done) {
        var compiledCode = t.compile(t.read(test.name + '.js'), test.name + '.js').toJs();
        var flxRegisterMatcher = /flx.start\(flx.m\('(.+?)'/g;

        var flxs = [],
            arr;
        while ((arr = flxRegisterMatcher.exec(compiledCode)) !== null) {
          flxs.push(arr[1]);
        }

        var l = test.expectations.length;
        assert.equal(l, flxs.length);

        for (var i = 0; i < l; ++i) {
          assert(h.isMatchingFluxionName(test.expectations[i], flxs[i]),
                  test.expectations[i] + ' !== ' + flxs[i]);
          delete flxs[i];
        }

        assert.deepEqual(flxs, []);
        done();
      });
    });
  });

  tests.postFluxions.forEach(function(test, index) {
    describe('postFluxions : ' + test.name + ' : \n', function() {
      it(test.desc, function (done) {
        var compiledCode = t.compile(t.read(test.name + '.js'), test.name + '.js').toJs();
        var flxRegisterMatcher = /flx.post\(flx.m\('(.+?)'/g;

        var flxs = [],
            arr;
        while ((arr = flxRegisterMatcher.exec(compiledCode)) !== null) {
          flxs.push(arr[1]);
        }

        var l = test.expectations.length;
        assert.equal(l, flxs.length);

        for (var i = 0; i < l; ++i) {
          assert(h.isMatchingFluxionName(test.expectations[i], flxs[i]),
                  test.expectations[i] + ' !== ' + flxs[i]);
          delete flxs[i];
        }

        assert.deepEqual(flxs, []);
        done();
      });
    });
  });
});

after(generateRoadmap);

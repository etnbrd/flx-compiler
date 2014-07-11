require('blanket')({
    pattern: function (filename) {
            return !/node_modules/.test(filename);
        }
});

var t = require('./tools'),
    assert = require('assert');

describe('Compilation', function () {
    describe('Problem #0 : \n', function () {
        it('source and result should be different', function (done) {
            var s = t.read('compile.js');
            assert.notEqual(s, t.compile(s));
            done();
        });
    });

    require('./tests').counts.forEach(function(test, index) {
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
});

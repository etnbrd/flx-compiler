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

    require("./tests").counts.forEach(function(test, index) {
        describe("Problem #" + (index + 1) + " : \n", function() {
            it(test.desc, function () {
                var filename = test.name + ".js";
                console.log(">>>> HERE");
                assert.equal(t.compile(t.read(filename), filename), t.expect(filename));
            })
        })
    })
});
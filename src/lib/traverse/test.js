var t = require('../../../test/tools.js'),
    vm = require('vm');

function basicTest(filename, expected, done) {
    var code = 't.compileAndMock(f).get(\'/\').expect(e).end(d);';
    var context = {
        t: t,
        f: filename,
        e: expected,
        d: done
    };
    vm.runInNewContext(code, context);
}


describe('Test Cases', function(){
    describe('IfStatement', function(){
        describe('outside of app.get', function(){
            it('if-then no else should compile', function(done){
                basicTest('ifthen-out.js', 'A', done);
            });

            it('if-then-else should compile', function(done){
                basicTest('ifthenelse-out.js', 'D', done);
            });
        });
        describe('inside of app.get', function(){
            it('if-then no else should compile', function(done){
                basicTest('ifthen-in.js', 'E', done);
            });

            it('if-then-else should compile', function(done){
                basicTest('ifthenelse-in.js', 'G', done);
            });
        });
    });
});

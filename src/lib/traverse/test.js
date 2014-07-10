var t = require('../../../test/tools.js');

// TODO all tests are useless :
// We want to make sure the compilation is happenning correctly.
// The compilation modify scope availability for distributed system.
// But in these tests, the global scope is accessible everywhere, so even if the compilation breaks, as it's the case now, the tests pass.

describe('Test Cases', function(){
    describe('IfStatement :', function(){
        describe('outside of app.get :', function(){
            it('if-then no else should compile', function(done){
                var srv = t.compileAndMock('ifthenout.js');
                srv.get('/')
                    .expect('B')
                    .end(done)
                    ;
            });

            it('if-then-else should compile', function(done){
                var srv = t.compileAndMock('ifthenelseout.js');
                srv.get('/')
                    .expect('D')
                    .end(done)
                    ;
            });
        });
        describe('inside of app.get :', function(){
            it('if-then no else should compile', function(done){
                var srv = t.compileAndMock('ifthenin.js');
                srv.get('/')
                    .expect('E')
                    .end(done)
                    ;
            });

            it('if-then-else should compile', function(done){
                var srv = t.compileAndMock('ifthenelsein.js');
                srv.get('/')
                    .expect('G')
                    .end(done)
                    ;
            });
        });
    });
});

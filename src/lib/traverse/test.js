var t = require('../../../test/tools.js');

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

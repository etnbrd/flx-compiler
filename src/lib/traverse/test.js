var t = require('../../../test/tools.js')
,   supertest = require('supertest');
;


function compileAndMock(filename) {
    return supertest(t.compileAndLoad(filename));
}

// describe('Test Cases', function(){
    describe('IfStatement :', function(){
        describe('outside of app.get :', function(){
            it('if-then no else should compile', function(done){
                var srv = compileAndMock('ifthenout.js')
                srv.get('/')
                    .expect('B')
                    .end(done)
                    ;
            });

            it('if-then-else should compile', function(done){
                var srv = compileAndMock('ifthenelseout.js')
                srv.get('/')
                    .expect('D')
                    .end(done)
                    ;
            });
        });
        describe('inside of app.get :', function(){
            it('if-then no else should compile', function(done){
                var srv = compileAndMock('ifthenin.js')
                srv.get('/')
                    .expect('E')
                    .end(done)
                    ;
            });

            it('if-then-else should compile', function(done){
                var srv = compileAndMock('ifthenelsein.js')
                srv.get('/')
                    .expect('G')
                    .end(done)
                    ;
            });
        });
    });

    // describe('YieldExpression', function(){
    //     it('if-then no else should compile', function(done){
    //         t.compileAndMock('yield.js')
    //         .get('/')
    //         .expect('third', done);
    //     })
    // })
// })
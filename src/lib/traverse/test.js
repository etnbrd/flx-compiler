var t = require('../../../test/tools.js')
;


function compileAndMock(filename) {
    return require('supertest')(t.compileAndLoad(filename));
}

describe('Test Cases', function(){
    describe('IfStatement', function(){
        describe('outside of app.get', function(){
            it('if-then no else should compile', function(done){
                compileAndMock('ifthen-out.js')
                    .get('/')
                    .expect('42')
                    .end(done)
                    ;
            })

            it('if-then-else should compile', function(done){
                compileAndMock('ifthenelse-out.js')
                    .get('/')
                    .expect('101010')
                    .end(done)
                    ;
            })
        })
        describe('inside of app.get', function(){
            it('if-then no else should compile', function(done){
                compileAndMock('ifthen-in.js')
                    .get('/')
                    .expect('42')
                    .end(done)
                    ;
            })

            it('if-then-else should compile', function(done){
                compileAndMock('ifthenelse-in.js')
                // compileAndMock('ifthenelse-out.js')
                    .get('/')
                    .expect('101010')
                    .end(done)
                    ;
            })
        })
    })

    // describe('YieldExpression', function(){
    //     it('if-then no else should compile', function(done){
    //         t.compileAndMock('yield.js')
    //         .get('/')
    //         .expect('third', done);
    //     })
    // })
})

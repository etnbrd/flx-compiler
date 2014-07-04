var t = require('../../../test/tools.js')
;

describe('Test Cases', function(){
    describe('IfStatement', function(){
        describe('outside of app.get', function(){
            it('if-then no else should compile', function(done){
                t.compileAndMock('ifthen-out.js')
                .get('/')
                .expect('42', done);
            })

            it('if-then-else should compile', function(done){
                t.compileAndMock('ifthenelse-out.js')
                .get('/')
                .expect('101010', done);
            })
        })
        describe('inside of app.get', function(){
            it('if-then no else should compile', function(done){
                t.compileAndMock('ifthen-in.js')
                .get('/')
                .expect('42', done);
            })

            it('if-then-else should compile', function(done){
                t.compileAndMock('ifthenelse-in.js')
                .get('/')
                .expect('101010', done);
            })
        })
    })
})

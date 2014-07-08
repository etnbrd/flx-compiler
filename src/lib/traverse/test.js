// var t = require('../../../test/tools.js')
// ,   supertest = require('supertest');
// ;


// function compileAndMock(filename) {
//     return supertest(t.compileAndLoad(filename));
// }

// // describe('Test Cases', function(){
//     describe('IfStatement :', function(){
//         describe('outside of app.get :', function(){
//             it('if-then no else should compile', function(done){
//                 var srv = compileAndMock('ifthenout.js')
//                 srv.get('/')
//                     .expect('B')
//                     .end(done)
//                     ;
//             });

//             it('if-then-else should compile', function(done){
//                 var srv = compileAndMock('ifthenelseout.js')
//                 srv.get('/')
//                     .expect('D')
//                     .end(done)
//                     ;
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
        describe('inside of app.get :', function(){
            it('if-then no else should compile', function(done){
//                 var srv = compileAndMock('ifthenin.js')
//                 srv.get('/')
//                     .expect('E')
//                     .end(done)
//                     ;
//             });

//             it('if-then-else should compile', function(done){
//                 var srv = compileAndMock('ifthenelsein.js')
//                 srv.get('/')
//                     .expect('G')
//                     .end(done)
//                     ;
//             });
//         });
//     });

//     // describe('YieldExpression', function(){
//     //     it('if-then no else should compile', function(done){
//     //         t.compileAndMock('yield.js')
//     //         .get('/')
//     //         .expect('third', done);
//     //     })
//     // })
// // })
                basicTest('ifthen-in.js', 'E', done);
            });

            it('if-then-else should compile', function(done){
                basicTest('ifthenelse-in.js', 'G', done);
            });
        });
    });
});

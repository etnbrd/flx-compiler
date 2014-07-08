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
                var srv = compileAndMock('ifthenout.js');
                srv.get('/')
                    .expect('B')
                    .end(done)
                    ;
            });

            it('if-then-else should compile', function(done){
                var srv = compileAndMock('ifthenelseout.js');
                srv.get('/')
                    .expect('D')
                    .end(done)
                    ;
            });
        });
        describe('inside of app.get :', function(){
            it('if-then no else should compile', function(done){
                var srv = compileAndMock('ifthenin.js');
                srv.get('/')
                    .expect('E')
                    .end(done)
                    ;
            });

            it('if-then-else should compile', function(done){
                var srv = compileAndMock('ifthenelsein.js');
                srv.get('/')
                    .expect('G')
                    .end(done)
                    ;
            });
        });
    });
// });




// var t = require('../../../test/tools.js'),
//     vm = require('vm');

// function basicTest(filename, expected, done) {
//     var code = 't.compileAndMock(f).get(\'/\').expect(e).end(d);';
//     var context = {
//         t: t,
//         f: filename,
//         e: expected,
//         d: done
//     };
//     vm.runInNewContext(code, context);
// }

// function sandbox(filename) {

//     function read(filename) {
//         console.log("./examples" + filename);
//         return require('fs').readFileSync('./examples/' + filename).toString();
//     }

//     var sandbox = {
//         filename: filename,
//         __dirname: __dirname,
//     };

//     var src = t.compile(read(filename));

//     // var code = [
//     //     "var app = require(__dirname + '/../results/' + filename).app"
//     // ].join('');

//     vm.runInThisContext(src, "MY_SANDBOX");
//     console.log("stuffs");

//     return sandbox;
// }


// describe('Test Cases', function(){
//     describe('IfStatement', function(){
//         describe('outside of app.get', function(){
            // it('if-then no else should compile', function(done){
            //     // basicTest('ifthen-out.js', 'A', done);
            //     var sb = sandbox("ifthenout.js");
            //     console.log(sb);
            //     done();
            // });

//             it('if-then-else should compile', function(done){
//                 basicTest('ifthenelse-out.js', 'D', done);
//             });
//         });
//             it('if-then no else should compile', function(done){
    //             basicTest('ifthen-in.js', 'E', done);
    //         });

    //         it('if-then-else should compile', function(done){
    //             basicTest('ifthenelse-in.js', 'G', done);
    //         });
    //     });
    // });
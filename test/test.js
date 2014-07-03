var t = require("./tools");

describe('Test Cases', function(){
  describe('Problem #1', function(){
    it('should compile problem #1', function(done){
        t.compileAndMock('count1.js')
            .get('/')
            .expect('42', done);
    })
  })

  describe('Problem #2', function(){
    it('should compile problem #2', function(done){
        t.compileAndMock('count2.js')
            .get('/')
            .expect('42', done);
    })
  })

  describe('Problem #3', function(){
    it('should compile problem #3', function(done){
        t.compileAndMock('count3.js')
            .get('/')
            .expect('42', done);
    })
  })

  describe('Problem #4', function(){
    it('should compile problem #4', function(done){
        var srv = t.compileAndMock('count4.js');

        srv.get('/').expect('42').end(function() {
          srv.get('/').expect('43').end(function() {
            done();
          })
        })
    })
  })
})
